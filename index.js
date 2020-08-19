//content script
let clickedElSelector = null;
let clickedElPosition = null;
let hiddenItemList = [];

chrome.storage.local.get(null, (e) => {
	let currentURl = window.location.href;
	for (const key in e) {
		if (key == currentURl) {
			hiddenItemList = e[key];
			e[key].map((elSelector) => {
				hideElement(elSelector);
			});
			break;
		}
	}
});

const makeSelector = (element) => {
	let { localName, id, className } = element;

	id = id ? '#' + id : '';
	className = className ? '.' + className.replace(/[ ]/g, '.') : '';
	return `${localName}${id}${className}`;
};

document.addEventListener(
	'contextmenu',
	function (event) {
		let { target } = event;
		clickedElSelector = `${makeSelector(
			target.parentElement.parentElement,
		)}>${makeSelector(target.parentElement)}>${makeSelector(target)}`;
		clickedElPosition = Array.prototype.indexOf.call(
			document.querySelectorAll(clickedElSelector),
			target,
		);
	},
	true,
);
// NOTE: Uncomment when you want to clean local storage
// chrome.storage.local.clear((e) => {
// 	console.log('clear everyshit');
// });

const hideElement = (elSelector) => {
	document
		.querySelectorAll(elSelector.element)
		[elSelector.position]?.classList.add('coderWand-cloak');
};
const undoHideElement = (elSelector) => {
	document
		.querySelectorAll(elSelector.element)
		[elSelector.position]?.classList.remove('coderWand-cloak');
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.isActive) {
		let clickedEl = {
			element: clickedElSelector,
			position: clickedElPosition,
		};
		sendResponse({ value: 'done' });
		hideElement(clickedEl);
		hiddenItemList.push(clickedEl);
		chrome.storage.local.set(
			{ [window.location.href]: hiddenItemList },
			function () {
				console.log('Value is set to ');
			},
		);
	}
	if (request.action == 'undo_hide') {
		undoHideElement(hiddenItemList.pop());
	}
});
