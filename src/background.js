'use strict'
let stateAllTabs = false;
let autoMute = false;

chrome.commands.onCommand.addListener(command => {
	switch (command) {
		case "mute_tab_current":
			chrome.tabs.getSelected(null, tab => {
				chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted});
			});
			break;

		case "mute_tab_all":
			stateAllTabs = !stateAllTabs;
			chrome.windows.getAll({populate: true}, windowList => {
				windowList.forEach(window => {
					window.tabs.forEach(tab => {
						if (tab.audible || tab.mutedInfo.muted) {
							chrome.tabs.update(tab.id, {muted: stateAllTabs});
						}
					});
				});
			});
			break;

		case "mute_tab_all_except_current":
			let activeTabId = 0;
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				activeTabId = tabs[0].id;
			});
			chrome.windows.getAll({populate: true}, windowList => {
				windowList.forEach(window => {
					window.tabs.forEach(tab => {
						if (tab.audible) {
							if(tab.id == activeTabId) {
								muteTab(activeTabId, false);
							}
							else {
								muteTab(tab.id, true);
							}
						}
					});
				});
			});
			break;
			
		case "auto_mute_tab_all_except_current":
			autoMute = !autoMute;
			break;

		default:
			break;
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	if(autoMute) {
		chrome.windows.getAll({populate: true}, windowList => {
			windowList.forEach(window => {
				window.tabs.forEach(tab => {
					if (tab.audible) {
						if(tab.id == activeInfo.tabId) {
							muteTab(activeInfo.tabId, false);
						}
						else {
							muteTab(tab.id, true);
						}
					}
				});
			});
		});
	}
});

async function muteTab(tabId, muted) {
  await chrome.tabs.update(tabId, {muted});
}