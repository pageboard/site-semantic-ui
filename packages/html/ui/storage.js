Page.setup(function(state) {
	Page.storage = new UserStore();
});
class UserStore {
	get(key) {
		var storage = window.localStorage;
		var val;
		if (storage) {
			try {
				val = storage.getItem(key);
			} catch(ex) {
				storage = null;
			}
		}
		if (!storage) {
			val = this.getCookies()[key];
		}
		return val;
	}
	set(key, val) {
		var storage = window.localStorage;
		if (storage) {
			try {
				storage.setItem(key, val);
			} catch(ex) {
				storage = null;
			}
		}
		if (!storage) {
			this.setCookie(key, val);
		}
	}
	del(key) {
		var storage = window.localStorage;
		if (storage) {
			try {
				storage.removeItem(key);
			} catch(ex) {
				storage = null;
			}
		}
		if (!storage) {
			this.clearCookie(key);
		}
	}
	clearCookies(re) {
		var cookies = this.getCookies();
		for (var key in cookies) {
			if (!re || re.test(key)) this.clearCookie(key);
		}
	}
	clearCookie(key) {
		document.cookie = `${key}=; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
	}
	getCookies() {
		return document.cookie.split(/; */).reduce((obj, str) => {
			if (str === "") return obj;
			const eq = str.indexOf('=');
			const key = eq > 0 ? str.slice(0, eq) : str;
			let val = eq > 0 ? str.slice(eq + 1) : null;
			if (val != null) try { val = decodeURIComponent(val); } catch(ex) { /* pass */ }
			obj[key] = val;
			return obj;
		}, {});
	}
	setCookie(key, val) {
		document.cookie = `${key}=${encodeURIComponent(val)}; Path=/; Secure; SameSite=Strict; Max-Age: 3e9`;
	}
}

