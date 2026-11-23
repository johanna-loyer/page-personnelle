window.controller = {
	fNotesList : [],
	fNotesDic : {},
	fImageZoneHeightRatio : 0.5,
	isHome: true,
	fIsLocal: window.location.protocol === "file:",
	fListeners : {"onCommand":[]},

	/* === Public ============================================================= */
	init : function() {
		try{
			this.fStartTime = new Date();
			this.fSlideshow = window.opener;
			if (!this.fSlideshow) throw "Cannot find Slideshow";
			// Listeners
			window.addEventListener("keyup", function(pEvt){controller.sOnKeyUp(pEvt)},false);
			window.addEventListener("message", (event) => {
				controller.receiveCommand(JSON.parse(event.data));
			}, false,);
			this.fBtnHme = scPaLib.findNode("ide:toolbar/des:button.btnHme");
			this.fBtnSrt = scPaLib.findNode("ide:toolbar/des:button.btnSrt");
			this.fBtnPrv = scPaLib.findNode("ide:toolbar/des:button.btnPrv");
			this.fBtnNxt = scPaLib.findNode("ide:toolbar/des:button.btnNxt");
			if (this.fIsLocal) document.body.classList.add("isLocal");
			if (scPaLib.findNode("ide:notes/chi:aside")){
				this.fNotesList = scPaLib.findNodes("ide:notes/chi:.targeableNote");
				this.fNotesList.forEach((note) => {controller.fNotesDic[note.getAttribute("data-slide-id")] = note});
				// Add SiRule to keep current selected element visible
				this.fKeepNoteVis = new this.EnsureVisibleTask("des:aside.trainNote.current",scPaLib.findNode("ide:notes"));
			} else document.body.classList.add("noNotes");

			window.setInterval(function () {controller.updateTime();}, 1000);
			scCoLib.addEventsHandler(this);
			this.sendCommand({cmd:"init"});
			this.sendCommand({cmd:"hidePointer"});
			this.updateImageZoneSize();
		} catch(e){
			scCoLib.error("ERROR - slideshow.init : "+e);
		}
	},

	setPreviewSize : function(pSize) {
		this.fImageZoneHeightRatio = pSize;
		this.updateImageZoneSize();
	},

	/** controller.register */
	register : function(pType, pFunc, pCtx) {
		if (!this.fListeners[pType]) {
			console.error("Listener not found : " + pType);
			return;
		}
		if (pCtx) {
			this.fListeners[pType].push(pFunc.bind(pCtx));
		} else this.fListeners[pType].push(pFunc);
	},

	/** controller.notifyListeners */
	notifyListeners : function(pType, pRes) {
		const vListener = this.fListeners[pType];
		for (let i=0; i<vListener.length; i++) {
			try {
				vListener[i](pRes);
			} catch(e) {console.info("ERROR controller.notifyListeners : "+e);}
		}
	},

	/** controller.onPageHide */
	onPageHide : function(){
		this.sendCommand({cmd:"close"});
	},

	/** controller.onResize */
	onResize : function (){
		this.updateZoneImages();
		this.updateImageZoneSize();
	},

	/** controller.initToc */
	initToc : function(pToc){
		sc$("menu").innerHTML = pToc;

		slideshow.fTocEntries = [];
		// Init all sub tocs
		const vSubs = scPaLib.findNodes("des:ul.tocListOpen", sc$("toc"));
		vSubs.forEach(item => {
			item.fTglBtn = scPaLib.findNode("psi:button",item);
		});
		const vFirstSubs = scPaLib.findNodes("chi:li/chi:ul.tocListOpen", sc$("toc"));
		for (i = 0; i < vFirstSubs.length; i++) slideshow.toggleMenuItem(vFirstSubs[i].fTglBtn, true);
		const vTocEntries = scPaLib.findNodes("des:a", sc$("toc"));
		for (i = 0; i < vTocEntries.length; i++){
			const vTocEntry = vTocEntries[i];
			vTocEntry.classList.remove("selected");
			vTocEntry.fIdx = vTocEntry.hash.substring(1);
			slideshow.fTocEntries[vTocEntry.fIdx] = vTocEntry;
			vTocEntry.onclick = function (){
				if (controller.isHome) controller.start();
				controller.sendCommand({cmd:"gotoSlide", id:this.fIdx});
				return false;
			}
		}
	},

	/** controller.updateUi */
	updateUi : function(pObj){
		if (pObj.cmd === "update"){
			//console.log("controller.updateUi : " + JSON.stringify(pObj));
			if (this.isHome !== pObj.isHome) this.fStartTime = new Date();
			this.isHome = pObj.isHome;
			this.fBtnNxt.disabled = !pObj.hasNext || pObj.isHome;
			this.fBtnPrv.disabled = !pObj.hasPrevious || pObj.isHome;
			this.fBtnSrt.disabled = !pObj.isHome;
			this.fBtnHme.disabled = pObj.isHome;
			sc$("counter").innerHTML = pObj.counter;
			// Ui aspect
			document.documentElement.setAttribute("data-theme", pObj.theme);
			if (pObj.zenMode) document.body.classList.add("zenMode");
			else document.body.classList.remove("zenMode");
			if (pObj.isHome) document.body.classList.add("isHome");
			else document.body.classList.remove("isHome");
			// Note management
			this.fNotesList.forEach((note) => {note.classList.remove("current")});
			if (this.fNotesDic[pObj.sldId]) this.fNotesDic[pObj.sldId].classList.add("current");
			if (this.fKeepNoteVis) this.fKeepNoteVis.resetNode();
			// Menu management
			if (slideshow.fCurrentEntry) slideshow.fCurrentEntry.classList.remove("selected");
			slideshow.fCurrentEntry = slideshow.fTocEntries[pObj.sldId];
			if (slideshow.fCurrentEntry) slideshow.fCurrentEntry.classList.add("selected");
			// Make sure this item is visible (open all ancestors)
			const vClosedSubTocs = scPaLib.findNodes("anc:ul.tocListClosed", slideshow.fCurrentEntry);
			for (i = 0; i < vClosedSubTocs.length; i++) slideshow.toggleMenuItem(vClosedSubTocs[i].fTglBtn, true);
			// Close all other auto-opened sub menus
			const iContainedInSub = function (pSub, pNode) {
				const vAncSubs = scPaLib.findNodes("anc:ul.tocList", pNode);
				for (let i = 0; i < vAncSubs.length; i++) if (vAncSubs[i] === pSub) return true;
				return false;
			};
			const iHasManuallyOpenedSub = function (pSub) {
				const vSubs = scPaLib.findNodes("des:ul.tocListOpen", pSub);
				for (let i = 0; i < vSubs.length; i++) if (!vSubs[i].fIsAuto) return true;
				return false;
			};
			const vOpenedSubs = scPaLib.findNodes("des:ul.tocListOpen", sc$("toc"));
			const vFilterIsOpened = scPaLib.compileFilter("ul.tocListOpen");
			for (i = 0; i < vOpenedSubs.length; i++) {
				const vSub = vOpenedSubs[i];
				// Sub must have been automatically opened, be still opened, not be part of the ancestors of the current link and not contain any manually subs...
				if (vSub.fIsAuto && scPaLib.checkNode(vFilterIsOpened,vSub) && !iContainedInSub(vSub,slideshow.fCurrentEntry) && !iHasManuallyOpenedSub(vSub)) slideshow.toggleMenuItem(vSub.fTglBtn, true);
			}
			// If this item has children, open the sub menu
			const vTocTgler = scPaLib.findNode("nsi:button.btnToggleClosed", slideshow.fCurrentEntry);
			if (vTocTgler) slideshow.toggleMenuItem(vTocTgler, true);
		} else if (pObj.cmd === "currentImage"){
			sc$("currentImage").innerHTML = '<img src="' + pObj.image + '" alt="" onload="controller.updateZoneImages()" onmousemove="controller.updatePointer(event)" onclick="controller.clickPointer(event)"/>'
			document.body.classList.remove("currentImagePending");
		} else if (pObj.cmd === "nextImage"){
			sc$("nextImage").innerHTML = '<img src="' + pObj.image + '" alt="" onload="controller.updateZoneImages()"/>'
			document.body.classList.remove("nextImagePending");
		}
	},

	updateZoneImages : function (){
		let contentWidth = scPaLib.findNode("des:div.structure").offsetWidth;
		scPaLib.findNodes("des:div.images/des:img").forEach((img) => contentWidth += img.naturalWidth + 40);
		if (window.innerWidth < contentWidth) document.body.classList.add("imageOverflow");
		else document.body.classList.remove("imageOverflow");
	},

	updateImageZoneSize : function (){
		const vImageZone = scPaLib.findNode("des:div.images");
		this.sendCommand({cmd:"imageZoneSize", width:vImageZone.clientWidth, height:(this.fHideNotes ? vImageZone.parentNode.clientHeight : vImageZone.parentNode.clientHeight*this.fImageZoneHeightRatio) - 50});
	},

	/** controller.togglePointer */
	togglePointer : function (){
		if (this.fSendPointer) {
			document.body.classList.remove("sendPointer");
			this.sendCommand({cmd:"hidePointer"});
		} else {
			document.body.classList.add("sendPointer");
			this.sendCommand({cmd:"showPointer"});
		}
		this.fSendPointer = !this.fSendPointer;
	},

	/** controller.clickPointer */
	clickPointer : function (pEvt){
		if (!this.fSendPointer) return;
		this.sendCommand({cmd:"clickPointer"});
	},

	/** controller.updatePointer */
	updatePointer : function (pEvt){
		if (!this.fSendPointer) return;
		const vImg = pEvt.target
		const vSizeFactor = vImg.naturalWidth / vImg.width;
		const vLeft = Math.round((pEvt.clientX - scSiLib.getOffsetLeft(vImg, document.body)) * vSizeFactor);
		const vTop = Math.round((pEvt.clientY - scSiLib.getOffsetTop(vImg, document.body)) * vSizeFactor);
		this.sendCommand({cmd:"updatePointer", left:vLeft, top:vTop});
	},

	/** controller.updateTime */
	updateTime : function (){
		const vCurrentTime = new Date();
		let vTimer = this.isHome ? 0 : (vCurrentTime.getTime() - this.fStartTime.getTime());
		vTimer =new Date(vTimer).toISOString().slice(11,19);
		sc$("time").innerHTML = `<span class="counter">${vTimer}</span><span class="separator"> - </span><span class="time">${vCurrentTime.toLocaleTimeString("fr-FR", {timeStyle: "short"})}</span>`
	},

	/** controller.sendCommand */
	sendCommand : function(pCmdObj){
		if (!pCmdObj.cmd) throw "controller.sendCommand : Illegal command object";
		this.fSlideshow.postMessage(JSON.stringify(pCmdObj), "*");
	},

	/** controller.receiveCommand */
	receiveCommand : function (pCmdObj){
		try {
			if (!pCmdObj.cmd) throw "controller.receiveCommand : Illegal command object";
			switch (pCmdObj.cmd) {
				case "init" : {
					controller.initToc(pCmdObj.toc);
					document.documentElement.setAttribute("data-theme", pCmdObj.theme)
					break;
				}
				case "update" : {
					controller.updateUi(pCmdObj);
					break;
				}
				case "currentImage" : {
					controller.updateUi(pCmdObj);
					break;
				}
				case "nextImage" : {
					controller.updateUi(pCmdObj);
					break;
				}
				case "currentImagePending" : {
					document.body.classList.add("currentImagePending");
					break;
				}
				case "nextImagePending" : {
					document.body.classList.remove("nextImageMissing");
					document.body.classList.add("nextImagePending");
					break;
				}
				case "nextImageMissing" : {
					document.body.classList.add("nextImageMissing");
					sc$("nextImage").innerHTML = "";
					controller.updateZoneImages();
					break;
				}
				default : {
					console.warn("Unknown command : " + pCmdObj.cmd);
				}
			}
			this.notifyListeners("onCommand", pCmdObj);
		} catch (e) {
			console.error("ERROR - controller.sendCommand : " + e);
		}
	},
	home : function(){
		this.sendCommand({cmd:"home"});
	},
	first : function(){
		this.sendCommand({cmd:"first"});
	},
	next : function(pSkip){
		this.sendCommand({cmd:"next", skip:pSkip});
	},
	previous : function(pSkip){
		this.sendCommand({cmd:"previous", skip:pSkip});
	},
	start : function(){
		this.sendCommand({cmd:"start"});
	},
	toggleZen : function(){
		this.sendCommand({cmd:"toggleZen"});
	},
	toggleToc : function(){
		this.sendCommand({cmd:"toggleToc"});
	},
	toggleOutline : function (){
		if (this.fHideOutline) document.body.classList.remove("hideOutline");
		else document.body.classList.add("hideOutline");
		this.fHideOutline = !this.fHideOutline;
		this.updateImageZoneSize();
	},
	toggleTime : function (){
		if (this.fHideTime) document.body.classList.remove("hideTime");
		else document.body.classList.add("hideTime");
		this.fHideTime = !this.fHideTime;
	},
	toggleNotes : function (){
		if (this.fHideNotes) {
			document.body.classList.remove("hideNotes");
			if (this.fKeepNoteVis) this.fKeepNoteVis.resetNode();
		}
		else document.body.classList.add("hideNotes");
		this.fHideNotes = !this.fHideNotes;
		this.updateImageZoneSize();
	},

	sOnKeyUp: function(pEvt) {
		const vKey = pEvt.key.toLowerCase();
		//console.log(`key: ${vKey}`)
		switch(vKey) {
			case "d"://D
			case "home"://↖
				if (controller.isHome) return;
				controller.first();
				return;
			case "h"://H
				if (controller.isHome) return;
				controller.home();
				return;
			case "m"://M
				if (controller.isHome) return;
				controller.toggleToc();
				return;
			case "c"://C
				if (!controller.isHome) return;
				controller.start();
				return;
			case "s"://S
				if (controller.isHome) controller.start();
				else controller.previous(true);
				return;
			case " "://space
			case "pagedown"://⇟
			case "arrowright"://→
			case "arrowdown"://↓
			case "n"://N
				if (controller.isHome) controller.start();
				else controller.next();
				return;
			case "backspace"://↤
			case "pageup"://⇞
			case "arrowleft"://←
			case "arrowup"://↑
			case "p"://P
				if (controller.isHome) return;
				controller.previous();
				return;
			case "t"://T
				if (controller.isHome) return;
				controller.next(true);
				return;
			case "z"://z
				controller.toggleZen();
				return;
		}
	}
}
controller.EnsureVisibleTask = function (pPathNode, pContainer) {
	//sc size rule that ensures a given node is visible in its container
	this.fPathNode = pPathNode;
	this.fContainer = pContainer;
	scOnLoads[scOnLoads.length] = this;
}
controller.EnsureVisibleTask.prototype = {
	onLoad : function() {
		try {
			this.resetNode();
			scSiLib.addRule(this.fContainer, this);
		} catch(e){scCoLib.logError("ERROR EnsureVisibleTask.onLoad",e);}
	},
	onResizedAnc : function(pOwnerNode, pEvent) {
		if(pEvent.phase===1 || pEvent.resizedNode === pOwnerNode) return;
		this.ensureVis();
	},
	onResizedDes : function(pOwnerNode, pEvent) {
		if(pEvent.phase===1) return;
		this.ensureVis();
	},
	resetNode : function() {
		this.fNode = scPaLib.findNode(this.fPathNode, this.fContainer);
		this.ensureVis();
	},
	initTask : function(pTargetScrollTop) {
		this.fTargetScrollTop = pTargetScrollTop;
		try{
			this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
			this.fCycles = Math.min(25, Math.max(10, Math.round(Math.abs(this.fContainer.scrollTop - this.fTargetScrollTop)/ 10)));
			scTiLib.addTaskNow(this);
		}catch(e){console.error("ERROR EnsureVisibleTask.initTask: "+e);}
	},
	execTask : function() {
		try{
			const vNow = Date.now ? Date.now() : new Date().getTime();
			while(this.fEndTime < vNow && this.fCycles >0) {
				//On saute des steps si le processor est trop lent.
				this.fCycles--;
				this.fEndTime += 100;
			}
			this.fCycles--;
			if(this.fCycles <= 0) {
				this.precipitateEndTask();
				return false;
			} else {
				this.fEndTime += 100;

				const vCurrScrollTop = this.fContainer.scrollTop;
				const vNewScrollTop = vCurrScrollTop - (2 * (vCurrScrollTop - this.fTargetScrollTop) / (this.fCycles + 1));
				this.fContainer.scrollTop = vNewScrollTop;
				return true;
			}
		}catch(e){console.error("ERROR EnsureVisibleTask.execTask: "+e);}
	},
	precipitateEndTask : function() {
		try{
			this.fContainer.scrollTop = this.fTargetScrollTop;
		}catch(e){console.error("ERROR EnsureVisibleTask.precipitateEndTask: "+e);}
	},
	ensureVis : function() {
		if( !this.fNode) return;
		try{
			let vParent = this.fNode.offsetParent;
			if( !vParent || vParent.tagName.toLowerCase() === "body") return;
			let vOffset = this.fNode.offsetTop;
			while(vParent !== this.fContainer) {
				const vNewParent = vParent.offsetParent;
				vOffset += vParent.offsetTop;
				vParent = vNewParent;
			}
			const vOffsetMiddle = vOffset + this.fNode.offsetHeight / 2;
			const vMiddle = this.fContainer.clientHeight / 2;
			const vDelta = Math.round(Math.max(0, (this.fNode.offsetHeight - this.fContainer.clientHeight) / 2));
			this.initTask(vOffsetMiddle - vMiddle - vDelta);
		} catch(e) {console.error("ERROR EnsureVisibleTask.ensureVis: "+e)}
	},
	loadSortKey : "SiZ",
	ruleSortKey : "Z"
}
window.slideshow = {
	toggleMenuItem : function(pBtn, pAuto){
		if (!pBtn) return;
		const vStatus = pBtn.className;
		const vUl = scPaLib.findNode("nsi:ul", pBtn);
		if (!vUl) return;
		vUl.fIsAuto = pAuto;
		if(vStatus === "btnToggleClosed") {
			pBtn.className = "btnToggleOpen";
			pBtn.innerHTML = '<span>V</span>';
			vUl.className = vUl.className.replace("tocListClosed", "tocListOpen");
			vUl.style.display = "";
		} else {
			pBtn.className = "btnToggleClosed";
			pBtn.innerHTML = '<span>></span>';
			vUl.className = vUl.className.replace("tocListOpen", "tocListClosed");
			vUl.style.display = "none";
			const vOpendSubMnus = scPaLib.findNodes("des:ul.tocListOpen", vUl);
			for (let i=0; i < vOpendSubMnus.length; i++) this.toggleMenuItem(vOpendSubMnus[i].fTglBtn, true);
		}
	}

}