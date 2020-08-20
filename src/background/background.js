const evanesco = {
	id: 'Evanesco',
	title: 'Evanesco - Vanishing Spell',
	contexts: ['all'],
};
chrome.contextMenus.create(evanesco);
// const obliviate = {
// 	id: 'Obliviate',
// 	title: 'Obliviate - Forgetfulness Charm',
// 	contexts: ['all'],
// };
// chrome.contextMenus.create(obliviate);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
	switch (info.menuItemId) {
		case 'Evanesco':
			chrome.tabs.sendMessage(tab.id, { action: 'hide' });
			break;
		case 'Obliviate':
			chrome.tabs.sendMessage(tab.id, { action: 'clear' });
			break;
	}
});

chrome.commands.onCommand.addListener(function (command) {
	switch (command) {
		case 'undo_hide':
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action: command });
			});
			break;
		case 'redo_hide':
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action: command });
			});
			break;
	}
});
