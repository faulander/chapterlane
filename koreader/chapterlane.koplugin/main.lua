local DataStorage = require("datastorage")
local InfoMessage = require("ui/widget/infomessage")
local InputDialog = require("ui/widget/inputdialog")
local JSON = require("json")
local LuaSettings = require("luasettings")
local Menu = require("ui/widget/menu")
local MultiInputDialog = require("ui/widget/multiinputdialog")
local NetworkMgr = require("ui/network/manager")
local UIManager = require("ui/uimanager")
local WidgetContainer = require("ui/widget/container/widgetcontainer")
local http = require("socket.http")
local logger = require("logger")
local ltn12 = require("ltn12")
local random = require("random")
local util = require("util")
local socketutil = require("socketutil")
local lowercase = type(util.stringLower) == "function" and util.stringLower or string.lower
local _ = require("gettext")

local ChapterLane = WidgetContainer:extend{
    name = "chapterlane",
    is_doc_only = true,
    settings_file = DataStorage:getSettingsDir() .. "/chapterlane.lua",
}

local function message(text)
    UIManager:show(InfoMessage:new{ text = text })
end

function ChapterLane:init()
    self.store = LuaSettings:open(self.settings_file)
    self.server = self.store:readSetting("server")
    self.token = self.store:readSetting("token")
    self.connection_id = self.store:readSetting("connection_id")
    self.queue = self.store:readSetting("queue", {})
    self.last_sent = self.store:readSetting("last_sent", {})
    self.completed = self.store:readSetting("completed", {})
    self.book_id = self.connection_id == self.ui.doc_settings:readSetting("chapterlane_connection_id")
        and self.ui.doc_settings:readSetting("chapterlane_book_id") or nil
    self.sync_task = function() self:syncCurrent(false) end
    self.ui.menu:registerToMainMenu(self)
end

function ChapterLane:save()
    self.store:saveSetting("server", self.server)
    self.store:saveSetting("token", self.token)
    self.store:saveSetting("connection_id", self.connection_id)
    self.store:saveSetting("queue", self.queue)
    self.store:saveSetting("last_sent", self.last_sent)
    self.store:saveSetting("completed", self.completed)
    self.store:flush()
end

-- socket.http is KOReader's HTTPS-capable LuaSocket wrapper. Do not follow redirects:
-- a redirect could forward the bearer token to a different host.
function ChapterLane:request(method, path, body)
    local sink = {}
    local headers = {
        ["Authorization"] = "Bearer " .. self.token,
        ["Accept"] = "application/json",
    }
    local request = {
        url = self.server .. path,
        method = method,
        headers = headers,
        sink = ltn12.sink.table(sink),
        redirect = false,
    }
    if body then
        local encoded = JSON.encode(body)
        headers["Content-Type"] = "application/json"
        headers["Content-Length"] = tostring(#encoded)
        request.source = ltn12.source.string(encoded)
    end
    socketutil:set_timeout(5, 15)
    local ok, request_result, code = pcall(http.request, request)
    socketutil:reset_timeout()
    if not ok or type(code) ~= "number" then
        local detail = type(code) == "string" and code or request_result
        return nil, _("Connection failed") .. ": " .. tostring(detail or _("unknown transport error"))
    end
    local decoded_ok, response = pcall(JSON.decode, table.concat(sink))
    if code ~= 200 then
        if decoded_ok and type(response) == "table" and type(response.error) == "string" then
            return nil, response.error
        end
        return nil, "HTTP " .. code
    end
    if not decoded_ok or type(response) ~= "table" then return nil, _("Invalid server response") end
    return response
end

function ChapterLane:configured()
    return self.server and self.token and self.server:match("^https://[^/@?%%#]+$")
end

-- Both keyboard entry and USB import use the same account-isolation rules.
function ChapterLane:setConnection(server, token)
    if type(server) ~= "string" or type(token) ~= "string" then return false end
    server = server:gsub("/+$", "")
    if not server:match("^https://[^/@?%%#]+$") or not token:match("^[A-Za-z0-9_-]+$") or #token ~= 43 then
        return false
    end
    if server ~= self.server or token ~= self.token then
        self.queue, self.last_sent, self.completed = {}, {}, {}
        self.connection_id = random.uuid()
        self.book_id = nil
        self.ui.doc_settings:delSetting("chapterlane_book_id")
    end
    self.server, self.token = server, token
    self:save()
    return true
end

function ChapterLane:importConnection()
    local path = DataStorage:getSettingsDir() .. "/chapterlane-connection.txt"
    local file = io.open(path, "r")
    if not file then message(_("Copy chapterlane-connection.txt into KOReader's settings directory first.")); return end
    local server = file:read("*l")
    local token = file:read("*l")
    local extra = file:read("*l")
    file:close()
    if extra or not self:setConnection(server and server:gsub("\r$", ""), token and token:gsub("\r$", "")) then
        message(_("Invalid connection file. Use HTTPS address on line 1 and device key on line 2."))
        return
    end
    if not os.remove(path) then
        message(_("Connection saved. Delete chapterlane-connection.txt from the device manually."))
    else
        message(_("Connection imported. Link this book from the menu."))
    end
end
function ChapterLane:configure()
    local dialog
    dialog = MultiInputDialog:new{
        title = _("ChapterLane connection"),
        fields = {
            { hint = _("HTTPS server URL"), text = self.server or "" },
            { hint = _("Device key"), text_type = "password" },
        },
        buttons = {{
            { text = _("Cancel"), id = "close", callback = function() UIManager:close(dialog) end },
            { text = _("Save"), callback = function()
                local fields = dialog:getFields()
                if not self:setConnection(fields[1], fields[2]) then
                    message(_("Enter an HTTPS origin and a valid device key."))
                    return
                end
                UIManager:close(dialog)
                message(_("ChapterLane connection saved. Link this book from the menu."))
            end },
        }},
    }
    UIManager:show(dialog)
    dialog:onShowKeyboard()
end

local function titleWords(text)
    local words = {}
    local normalized = lowercase(text):gsub("[%p]", " ")
    for word in normalized:gmatch("%S+") do
        if #word > 3 then words[#words + 1] = word end
    end
    if #words == 0 then
        for word in normalized:gmatch("%S+") do words[#words + 1] = word end
    end
    return words
end

local function oneEditApart(a, b)
    if math.abs(#a - #b) > 1 then return false end
    local i, j, differences = 1, 1, 0
    while i <= #a and j <= #b do
        if a:byte(i) == b:byte(j) then
            i, j = i + 1, j + 1
        else
            differences = differences + 1
            if differences > 1 then return false end
            if #a >= #b then i = i + 1 end
            if #a <= #b then j = j + 1 end
        end
    end
    return true
end

local function titleScore(title, query, query_words)
    local lower = lowercase(title)
    if lower == query then return 1000 end
    if lower:find(query, 1, true) then return 900 end
    local title_words = titleWords(title)
    local matched = 0
    for _, term in ipairs(query_words) do
        for _, word in ipairs(title_words) do
            if word == term or (#term >= 4 and #word >= 4 and (
                word:find(term, 1, true) == 1 or term:find(word, 1, true) == 1
                or oneEditApart(term, word))) then
                matched = matched + 1
                break
            end
        end
    end
    if matched == 0 or (matched < math.ceil(#query_words * 0.6) and matched < #title_words) then
        return nil
    end
    return matched * 100 / #query_words - math.abs(#title_words - #query_words)
end

function ChapterLane:chooseBook()
    if not self:configured() then message(_("Set up the ChapterLane connection first.")); return end
    if not NetworkMgr:isOnline() then message(_("Connect to Wi-Fi to fetch your library.")); return end
    local result, err = self:request("GET", "/api/device/books")
    if not result then message(err); return end
    if type(result.books) ~= "table" then message(_("Invalid library response")); return end
    local books = {}
    for _, book in ipairs(result.books) do
        if type(book.book_id) == "string" and type(book.title) == "string"
            and (book.status == "planned" or book.status == "active") then
            books[#books + 1] = book
        end
    end
    if #books == 0 then message(_("No planned or active books in your ChapterLane library.")); return end

    local menu
    local showMatches
    local function editFilter(query)
        local dialog
        dialog = InputDialog:new{
            title = _("Filter ChapterLane books"),
            input = query,
            buttons = {{
                { text = _("Cancel"), id = "close", callback = function() UIManager:close(dialog) end },
                { text = _("Search"), is_enter_default = true, callback = function()
                    local updated = dialog:getInputText():match("^%s*(.-)%s*$")
                    UIManager:close(dialog)
                    showMatches(updated)
                end },
            }},
        }
        UIManager:show(dialog)
        dialog:onShowKeyboard()
    end

    showMatches = function(query)
        local matches = {}
        if query == "" then
            for _, book in ipairs(books) do matches[#matches + 1] = { book = book, score = 0 } end
        else
            local lower = lowercase(query)
            local query_words = titleWords(query)
            for _, book in ipairs(books) do
                local score = titleScore(book.title, lower, query_words)
                if score then matches[#matches + 1] = { book = book, score = score } end
            end
        end
        table.sort(matches, function(a, b)
            if a.score ~= b.score then return a.score > b.score end
            return a.book.title < b.book.title
        end)
        local items = {{ text = _("Change search…"), callback = function() editFilter(query) end }}
        if query ~= "" then
            items[#items + 1] = { text = _("Show all books"), callback = function() showMatches("") end }
        end
        if #matches == 0 then
            items[#items + 1] = { text = _("No matching books. Change the search above."), select_enabled = false }
        end
        for i = 1, #matches do
            local book = matches[i].book
            items[#items + 1] = {
                text = book.title .. " — " .. (type(book.authors) == "string" and book.authors or "") .. " [" .. book.book_id .. "]",
                callback = function()
                    self.book_id = book.book_id
                    if type(book.percent) == "number" then
                        self.last_sent[book.book_id] = math.max(self.last_sent[book.book_id] or 0, book.percent)
                        self:save()
                    end
                    self.ui.doc_settings:saveSetting("chapterlane_book_id", book.book_id)
                    self.ui.doc_settings:saveSetting("chapterlane_connection_id", self.connection_id)
                    UIManager:close(menu)
                    self.book_menu = nil
                    message(_("Book linked. Progress will sync when reading."))
                    self:syncCurrent(false)
                end,
            }
        end
        local subtitle = query ~= "" and (query .. " (" .. #matches .. ")") or _("All books")
        if menu then
            menu:switchItemTable(nil, items, nil, nil, subtitle)
        else
            menu = Menu:new{ title = _("Link a ChapterLane book"), subtitle = subtitle, item_table = items }
            self.book_menu = menu
            UIManager:show(menu)
        end
    end
    local props = self.ui.doc_props or {}
    local title = props.title or props.display_title or ""
    showMatches(title:match("^%s*(.-)%s*$"))
end

function ChapterLane:percent()
    local document = self.ui.document
    if not document then return nil end
    local progress = document.info.has_pages and self.ui.paging:getLastPercent()
        or self.ui.rolling:getLastPercent()
    if type(progress) ~= "number" or progress ~= progress then return nil end
    return math.max(0, math.min(100, math.floor(progress * 100 + 0.5)))
end

function ChapterLane:enqueue(event)
    event.event_id = random.uuid()
    self.queue[#self.queue + 1] = event
    self:save() -- Persist the ID before the first request, so an uncertain reply is retry-safe.
end
function ChapterLane:highestQueuedPercent(book_id)
    local highest = self.last_sent[book_id] or -1
    for _, event in ipairs(self.queue) do
        if event.book_id == book_id and event.percent then
            highest = math.max(highest, event.percent)
        end
    end
    return highest
end

function ChapterLane:drain(interactive)
    if not self:configured() or not NetworkMgr:isOnline() then return false end
    while #self.queue > 0 do
        local event = self.queue[1]
        local result, err = self:request("POST", "/api/device/sync", event)
        if not result or (result.result ~= "applied" and result.result ~= "duplicate") then
            if interactive then message(err or _("Invalid sync response")) end
            logger.warn("ChapterLane: sync failed", err or "invalid response")
            return false
        end
        if event.status == "completed" then self.completed[event.book_id] = true end
        if event.percent then
            self.last_sent[event.book_id] = math.max(self.last_sent[event.book_id] or 0, event.percent)
        end
        table.remove(self.queue, 1)
        self:save()
    end
    return true
end

function ChapterLane:syncCurrent(interactive)
    if not self.book_id or not self:configured() or self.completed[self.book_id] then
        if interactive then message(_("Configure ChapterLane and link this book first.")) end
        return
    end
    if not self:drain(interactive) then
        if interactive and not NetworkMgr:isOnline() then message(_("Connect to Wi-Fi to sync.")) end
        return
    end
    local percent = self:percent()
    if not percent then return end
    if percent > (self.last_sent[self.book_id] or -1) then
        self:enqueue({ book_id = self.book_id, status = "active", percent = percent })
        if not self:drain(interactive) then return end
    end
    if interactive then message(_("ChapterLane progress is up to date.")) end
end

function ChapterLane:complete()
    if not self.book_id or not self:configured() then message(_("Link this book first.")); return end
    if self.completed[self.book_id] then message(_("Already marked completed on ChapterLane.")); return end
    local ConfirmBox = require("ui/widget/confirmbox")
    UIManager:show(ConfirmBox:new{
        text = _("Mark this book completed on ChapterLane?"),
        ok_callback = function()
            if not NetworkMgr:isOnline() then message(_("Connect to Wi-Fi to complete this book.")); return end
            self:syncCurrent(false)
            if self.completed[self.book_id] then message(_("Already marked completed on ChapterLane.")); return end
            if #self.queue > 0 then self:drain(true); return end
            self:enqueue({ book_id = self.book_id, status = "completed" })
            if self:drain(true) then message(_("Marked completed on ChapterLane.")) end
        end,
    })
end

function ChapterLane:discardPending()
    if #self.queue == 0 then message(_("No pending ChapterLane updates.")); return end
    local ConfirmBox = require("ui/widget/confirmbox")
    UIManager:show(ConfirmBox:new{
        text = _("Discard all unsent ChapterLane updates? They cannot be recovered."),
        ok_callback = function()
            self.queue = {}
            self:save()
            message(_("Pending updates discarded."))
        end,
    })
end
function ChapterLane:addToMainMenu(menu_items)
    menu_items.chapterlane = {
        text = _("ChapterLane"),
        sorting_hint = "more_tools",
        sub_item_table = {
            { text = _("Connection settings"), callback = function() self:configure() end },
            { text = _("Import connection file"), callback = function() self:importConnection() end },
            { text = _("Link this book"), callback = function() self:chooseBook() end },
            { text = _("Sync now"), callback = function() self:syncCurrent(true) end },
            { text = _("Mark completed"), callback = function() self:complete() end },
            { text = _("Discard pending updates"), callback = function() self:discardPending() end },
        },
    }
end

function ChapterLane:onReaderReady()
    self:drain(false)
end

function ChapterLane:onPageUpdate(page)
    if not page or not self.book_id or self.completed[self.book_id] then return end
    UIManager:unschedule(self.sync_task)
    UIManager:scheduleIn(30, self.sync_task)
end

function ChapterLane:onNetworkConnected()
    UIManager:scheduleIn(1, function() self:syncCurrent(false) end)
end

function ChapterLane:onCloseDocument()
    UIManager:unschedule(self.sync_task)
    if not self.book_id or self.completed[self.book_id] then return end
    local percent = self:percent()
    if percent and percent > self:highestQueuedPercent(self.book_id) then
        -- Preserve unsent progress if Wi-Fi is off when closing the reader.
        self:enqueue({ book_id = self.book_id, status = "active", percent = percent })
    end
    self:drain(false)
end

function ChapterLane:onCloseWidget()
    UIManager:unschedule(self.sync_task)
end

return ChapterLane
