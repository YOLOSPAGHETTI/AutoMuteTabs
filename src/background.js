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
			toggleAutomute();
			break;

		default:
			break;
	}
});

chrome.action.onClicked.addListener((tab) => {
	toggleAutomute();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
	//console.log("switchWindows");
	if(autoMute) {
		chrome.windows.getAll({populate: true}, windowList => {
			windowList.forEach(window => {
				window.tabs.forEach(tab => {
					if (tab.audible) {
						muteTab(tab.id, true);
					}
				});
			});
		});
		//console.log("windowId: " + windowId);
		if( windowId !== chrome.windows.WINDOW_ID_NONE ) {
			chrome.tabs.query({active: true, windowId: windowId}, function( tabs ) {
				let currentSelected = tabs[0].id;
				//console.log("tabid: " + currentSelected);
				muteTab(currentSelected, false);
			});
		}
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	//console.log("switchTabs");
	if(autoMute) {
		chrome.windows.getAll({populate: true}, windowList => {
			windowList.forEach(window => {
				window.tabs.forEach(tab => {
					if (tab.audible) {
						//console.log("tab.id: " + tab.id);
						//console.log("activeInfo.tabId: " + activeInfo.tabId);
						if(tab.id == activeInfo.tabId) {
							muteTab(tab.id, false);
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

function toggleAutomute() {
	autoMute = !autoMute;
	if(autoMute) {
		chrome.action.setIcon({ path: "imgs/16 bright.png" });
	}
	else {
		chrome.action.setIcon({ path: "imgs/16.png" });
	}
	//console.log("autoMute: " + autoMute);
}