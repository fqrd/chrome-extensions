chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.local.get(["blocked", "deadline", "forever", "locked"], function (local) {
		if (!Array.isArray(local.blocked)) {
			chrome.storage.local.set({ blocked: [] });
		}

		if (!Array.isArray(local.forever)) {
			chrome.storage.local.set({ forever: [] });
		}
		
		if (!local.deadline) {
			chrome.storage.local.set({ deadline: Date.now()});
		}

		if(typeof local.locked !== "boolean")
		{
			console.log("NOT BOOLEAN");
			chrome.storage.local.set({locked: false});
		}
	});
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
	const url = changeInfo.pendingUrl || changeInfo.url;
	if (!url || !url.startsWith("http")) {
		return;
	}
	const hostname = new URL(url).hostname;
	chrome.storage.local.get(["blocked", "forever", "deadline", "locked"], function (local) {
		const {blocked, forever, deadline, locked} = local;
		const now = Date.now();
		const limit = new Date(deadline);
		if (locked && limit - now > 0 && Array.isArray(blocked) && blocked.find(domain => hostname.includes(domain))) {
			chrome.tabs.remove(tabId);
			return;
		}
		if (Array.isArray(forever) && forever.find(domain => hostname.includes(domain))) {
			chrome.tabs.remove(tabId);
			return;
		}
	});
});