let str = `
local text = "hello world"
local key = "12345678"

local function desencode(key, text, padding)
	local c = crypt.desencode(key, text, crypt.padding[padding or "iso7816_4"])
	return crypt.base64encode(c)
end

local function desdecode(key, text, padding)
	text = crypt.base64decode(text)
	return crypt.desdecode(key, text, crypt.padding[padding or "iso7816_4"])
end

local etext = desencode(key, text)
assert( etext == "KNugLrX23UcGtcVlk9y+LA==")
assert(desdecode(key, etext) == text)

local etext = desencode(key, text, "pkcs7")
assert(desdecode(key, etext, "pkcs7") == text)

assert(desencode(key, "","pkcs7")=="/rlZt9RkL8s=")
assert(desencode(key, "1","pkcs7")=="g6AtgJul6q0=")
assert(desencode(key, "12","pkcs7")=="NefFpG+m1O4=")
assert(desencode(key, "123","pkcs7")=="LDiFUdf0iew=")
assert(desencode(key, "1234","pkcs7")=="T9u7dzBdi+w=")
assert(desencode(key, "12345","pkcs7")=="AGgKdx/Qic8=")
assert(desencode(key, "123456","pkcs7")=="ED5wLgc3Mnw=")
assert(desencode(key, "1234567","pkcs7")=="mYo+BYIT41M=")
assert(desencode(key, "12345678","pkcs7")=="ltACiHjVjIn+uVm31GQvyw==")

print(desencode(key, "12345678","pkcs7"))
`

var LuaVM = require('./dist/lua.vm.js');

var l = new LuaVM.Lua.State();

//l.execute('print("Hello, world")')
//l.execute(str)

str = `
User_GetOther_Info_List 26 {
    request {
        .Kid2UidList {
            kid                 0 : integer
            uidList             1 : *integer
        }

        kid2UidList 0 : *Kid2UidList
    }

    response {
        data        0 : integer    # 简要信息列表
    }
}

# 额外添加的客户端数据
User_ReportClientInfo 27 {
    request {
        timeZone        0 : integer             # 时区
    }
}
`

l.execute(`
_G.sproto = dofile('sproto.lua')
_G.sprotoparser = dofile('sprotoparser.lua')
_G.sprotoloader = dofile('sprotoloader.lua')
_G.dkjson = dofile('dkjson.lua')
`)

let [json] = l.execute(`
--
local str = crypt.hexdecode('${Buffer.from(str).toString('hex')}')
local sp = sproto.parse(str)
sproto_core.dumpproto(sp.__cobj)
local t,p = sproto_core.info(sp.__cobj)
return dkjson.encode({t,p})
`)

console.log(json)