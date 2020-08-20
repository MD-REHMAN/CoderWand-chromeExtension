const Wizard = {
	undo_stack: [],
	redo_stack: [],
	execute: function (command) {
		this.undo_stack.push(command);
		command.execute();
	},
	undo: function () {
		let activeCommand = this.undo_stack.pop();
		activeCommand?.undo();
		this.redo_stack.push(activeCommand);
	},
	redo: function () {
		let activeCommand = this.redo_stack.pop();
		activeCommand?.execute();
		this.undo_stack.push(activeCommand);
	},
};

function HideElement({ selector, position }) {
	this.selector = selector;
	this.position = position;
}
HideElement.prototype.execute = function () {
	document
		.querySelectorAll(this.selector)
		[this.position]?.classList.add('coderWand-cloak');
};
HideElement.prototype.undo = function () {
	document
		.querySelectorAll(this.selector)
		[this.position]?.classList.remove('coderWand-cloak');
};

const app = {
	clickedEl: {},
	init: function () {
		// NOTE: uncomment below line to clear Chrome Local Storage
		// this.clearChromeLocalData();
		this.getChromeLocalData().addListeners();
	},
	getChromeLocalData: function () {
		chrome.storage.local.get(null, (localData) => {
			let currentURl = window.location.href;
			localData[currentURl]?.map((el) => {
				Wizard.execute(new HideElement(el));
			});
		});
		return this;
	},
	addListeners: function () {
		document.addEventListener(
			'contextmenu',
			(event) => {
				let { target } = event;
				let selector = `${this.makeSelector(
					target.parentElement.parentElement,
				)}>${this.makeSelector(target.parentElement)}>${this.makeSelector(
					target,
				)}`;
				let position = Array.prototype.indexOf.call(
					document.querySelectorAll(selector),
					target,
				);
				this.clickedEl = {
					selector,
					position,
				};
			},
			true,
		);

		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			switch (request.action) {
				case 'hide':
					sendResponse({ value: 'done' });
					Wizard.execute(new HideElement(this.clickedEl));
					this.setChromeLocalData();
					break;
				case 'undo_hide':
					Wizard.undo();
					this.setChromeLocalData();
					break;
				case 'redo_hide':
					Wizard.redo();
					break;
			}
		});
		return this;
	},
	makeSelector: function (element) {
		let { localName, id, className } = element;

		id = id ? '#' + id : '';
		className = className ? '.' + className.replace(/[ ]/g, '.') : '';
		return `${localName}${id}${className}`;
	},
	setChromeLocalData: function () {
		chrome.storage.local.set({ [window.location.href]: Wizard.undo_stack });
		return this;
	},
	clearChromeLocalData: function () {
		chrome.storage.local.clear();
		return this;
	},
};
app.init();
