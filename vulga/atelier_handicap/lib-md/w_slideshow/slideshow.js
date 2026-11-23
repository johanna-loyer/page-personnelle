window.slideshow = {
	fBtnPath : "ide:root/chi:nav.tools",
	fHomePath : "ide:home",
	fTocPath : "ide:tocFrame",
	fTocScrollPath : "ide:tocScroll",
	fIsHome : true,
	fReady : false,
	fObjectives : false,
	fMap : false,
	fTools : false,
	fToc : null,
	fTocSrl : null,
	fTglBtn : null,
	fSldCnt : [],
	fAltBlkCnt : [],
	fTocEntries : {},
	fSldList : [],
	fSldCount : 0,
	fBlkCount : 0,
	fThemingBtnActive: false,
	fThemingBtnPath: "bod:",
	fCounterTemplate : '<span class="blkPercent">øblock%ø%</span>', // Available : øcurrentSlideø, øtotalSlidesø, øcurrentBlockø, øcurrentBlockInSlideø, øtotalBlocksø, øblock%ø, øslide%ø
	fDysOptions : {                             // Accessibility bar options
		type: "dys",                              // Unused
		storeRootKey : null,                      // Properties store root key - set to "" for domain-wide storage
		pathRoot: "ide:root",                     // Path to root element - used for dynamic resizing
		pathContent: "ide:slideFrame",            // Path to main page content
		pathBtnParent : "ide:root/chi:nav.tools", // Path to button insert point
		pathPanelParent : "ide:root",             // Path to panel insert point
		disable: false,
		defaultPanelInactive: true,               // true : panel closed by default
		optNumHeadings: true,                     // true : include heading numbering option - see following 'counter' options for more control
		counterFormat: "1",                       // Counter format, available formats 1,A,a,I,i ex : "I1a" displays heading counter 5.4.3. as V.4.c.
		counterExcludes : {},                     // List of excluded page types ex : {"obj":true, "intro":true} will exclude the objectives en intruduction pages
		counterMaxDepth : 1000,                   // Maximum depth of the counters ex : '3' will mean that only the three first leves will have counters added
		counterSuffix : ". ",                     // The string that is suffixed to all counters
		optScaleH2: true,                         // true : page title scaling option
		optAltLineColor: true,                    // true : color text lines in three colors option
		optFontActive: "true"==="true",                 // true : change font option
		optFontSize: true,                        // true : change font size option
		defaults:{                                // Default values for each option
			dysFontActive:"false",
			dysFontList:["OpenDyslexic"],
			dysFontSize:false,                      // Ex : 120 : text zoomed to 120% by default
			dysNumHeadings:false,
			dysScaleH2:false,
			dysAltLineColor:false
		},
		ignoreFilter: ".dysPanel|.hidden|.footnotes|.CodeMirror-static|script|noscript|object|.tooltip_ref|.bkSolResOut|.toolbar|.txt_mathtex_tl|.MathJax_Preview|.MathJax_SVG_Display|i.type"
	},
	fControllerWindowFeatures : "popup,width=1200,height=800",
	fControllerImageDelay : 0,
	fControllerImageScale : {current : 0.33, next : 0.20},
	fFileSystem: window.location.protocol === "file:",
	fListeners : {"onPointerClick":[], "onCommand":[]},
	fStrings : ["menu","",
		/*02*/	"Cacher le menu (touche M)","Afficher le menu (touche M)",
		/*04*/	"défilement haut","Faire défiler le menu vers le haut",
		/*06*/	"défilement bas","Faire défiler le menu vers le bas",
		/*08*/  "", "thème",
		/*10*/  "Passer au thème sombre", "Passer au thème clair",
		""],

	/* === Public ============================================================= */
	init : function(pParam) {
		if (!pParam) pParam = {};
		try{
			let i;
			if (scHPS.fDisabled) return;
			this.fHome = scPaLib.findNode(this.fHomePath);
			this.fToc = scPaLib.findNode(this.fTocPath);
			this.fTocSrl = scPaLib.findNode(this.fTocScrollPath);
			this.fProgressBar = scPaLib.findNode("des:.progressbar");
			this.fProgressBar.className = this.fProgressBar.className + " prog_0";
			this.fControllerImageScale.ratio = this.fControllerImageScale.next / this.fControllerImageScale.current
			scDynUiMgr.addElement("div", this.fProgressBar, "progCount");
			// init toc position
			if(localStorage.getItem(scServices.scLoad.fRootUrl+"tocClose") === "false") this.openToc();
			else this.closeToc();
			// Init all sub tocs
			const vSubs = scPaLib.findNodes("des:ul.tocListOpen", sc$("toc"));
			vSubs.forEach(item => {
				item.fTglBtn = scPaLib.findNode("psi:button",item);
			});
			const vFirstSubs = scPaLib.findNodes("chi:li/chi:ul.tocListOpen", sc$("toc"));
			for (i = 0; i < vFirstSubs.length; i++) this.toggleMenuItem(vFirstSubs[i].fTglBtn, true);
			const vTocEntries = scPaLib.findNodes("des:a", this.fTocSrl);
			for (i = 0; i < vTocEntries.length; i++){
				const vTocEntry = vTocEntries[i];
				vTocEntry.fIdx = vTocEntry.hash.substring(1);
				this.fTocEntries[vTocEntry.fIdx] = vTocEntry;
			}
			scPresMgr.toggleKeyboardNavigation(false);
			// Register scPresMgr listeners
			scPresMgr.register("onSldShow",this.onHpsSldShow);
			scPresMgr.register("onSldRestart",this.onHpsSldShow);
			scPresMgr.register("onBlkShow",this.onHpsBlkShow);
			scPresMgr.register("onAction",this.onHpsAction);
			scPresMgr.register("onKeyPress",this.onHpsKeyPress);
			// Add SiRule to keep current selected element visible
			this.fKeepVis = new this.EnsureVisibleTask("des:a.selected",this.fTocSrl);
			scSiLib.addRule(this.fHome, this);
			this.resizeHome();

			// Accessibility Toolbar
			if(pParam.accessBar !== "none"){
				this.setDysOptions(pParam.accessBar);
				const vScript = document.createElement('script');
				vScript.setAttribute("src", scServices.scLoad.resolveDestUri("/lib-md/w_slideshow/dys/dys.js"))
				document.getElementsByTagName("head")[0].appendChild(vScript);
				const vCss = document.createElement("link");
				vCss.setAttribute("rel", "stylesheet")
				vCss.setAttribute("type", "text/css")
				vCss.setAttribute("href", scServices.scLoad.resolveDestUri("/lib-md/w_slideshow/dys/dys.css"));
				document.getElementsByTagName("head")[0].appendChild(vCss);
			}

			// Theme button
			if(this.fThemingBtnActive || pParam.themeMode==="button"){
				let vBd = dom.newBd(scPaLib.findNode(this.fThemingBtnPath));
				this.fThemingBtn = vBd.elt("a", "themeBtn")
					.att("href", "#")
					.att("role", "button")
					.prop("fTheme", localStorage.getItem(scServices.scLoad.fRootUrl+"theme-preference") ? localStorage.getItem(scServices.scLoad.fRootUrl+"theme-preference") : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
					.prop("setPreference", function (){
						localStorage.setItem(scServices.scLoad.fRootUrl+"theme-preference", this.fTheme);
						this.reflectPreference();
					})
					.prop("reflectPreference", function (){
						document.documentElement.setAttribute("data-theme", this.fTheme);
						this.setAttribute("title", this.fTheme === "dark" ? slideshow.fStrings[11] : slideshow.fStrings[10]);
						slideshow.updateController();
						slideshow.updateControllerImages({forceNext:true});
					})
					.listen("click", function(){
						this.fTheme = this.fTheme === "light" ? "dark" : "light";
						this.setPreference();
					})
					.call("setPreference")
					.elt("span").text(this.fStrings[9]).up().currentUp();

				window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({matches:isDark}) => {
					slideshow.fThemingBtn.fTheme = isDark ? "dark" : "light";
					slideshow.fThemingBtn.setPreference();
				});
			} else if (pParam.themeMode !== "none"){
				document.documentElement.setAttribute("data-theme", pParam.themeMode);
			}

			// Listeners
			window.addEventListener("keyup", function(pEvt){slideshow.sOnKeyUp(pEvt)},false);
			window.addEventListener("message", (event) => {
				slideshow.receiveCommand(JSON.parse(event.data));
			}, false,);

			scCoLib.addEventsHandler(this);
		} catch(e){
			console.error("ERROR - slideshow.init : "+e);
		}
	},

	register : function(pType, pFunc, pCtx) {
		if (!this.fListeners[pType]) {
			console.error("Listener not found : " + pType);
			return;
		}
		if (pCtx) {
			this.fListeners[pType].push(pFunc.bind(pCtx));
		} else this.fListeners[pType].push(pFunc);
	},
	notifyListeners : function(pType, pRes) {
		const vListener = this.fListeners[pType];
		for (let i=0; i<vListener.length; i++) {
			try {
				vListener[i](pRes);
			} catch(e) {console.info("ERROR slideshow.notifyListeners : "+e);}
		}
	},

	updateImageScales: function (pOptObj) {
		const vRootWidth = sc$("slideFrame").clientWidth;
		const vRootHeight = sc$("slideFrame").clientHeight;
		let vCurrentScale;
		if (vRootWidth > vRootHeight) vCurrentScale = Math.min((pOptObj.width / (1 + this.fControllerImageScale.ratio)) / vRootWidth, pOptObj.height / vRootHeight);
		else vCurrentScale = pOptObj.height / vRootHeight;
		this.fControllerImageScale.current = vCurrentScale;
		this.fControllerImageScale.next = vCurrentScale * this.fControllerImageScale.ratio;
		this.updateControllerImages({forceNext:true});
	},

	/** slideshow.getControllerImageOptions */
	getControllerImageOptions: function (pNextBlock) {
		const vOpt = {
			logging: false
		}
		if (this.fShowZoom){
			vOpt.scale = this.fControllerImageScale.current;
			vOpt.ignoreElements = function (elt) {
				if (elt.id === "root") return true;
				if (elt.id === "home") return true;
				if (slideshow.fFileSystem){
					if (scPaLib.checkNode("img|audio|video", elt)) return true;
				}
			}
			vOpt.onclone = function (doc, elt){
				if (slideshow.fFileSystem) elt.classList.add("fileSystemPreview");
			}
		} else if (pNextBlock){
			vOpt.scale = this.fControllerImageScale.next;
			vOpt.ignoreElements = function (elt) {
				if (elt.id === "home") return true;
				if (scPaLib.checkNode(".ssSlide|.ssBk", elt) && !scPaLib.checkNode(".nextImage", elt)) return true;
				if (elt.id === "zoomFrame") return true;
				if (scPaLib.checkNode("nav.tools", elt)) return true;
				if (scPaLib.checkNode("div.basket", elt)) return true;
				if (scPaLib.checkNode("div.tooltip_fra", elt)) return true;
				if (scPaLib.checkNode("footer", elt)) return true;
				if (scPaLib.checkNode("a.zoom", elt)) return true;
				if (slideshow.fFileSystem){
					if (scPaLib.checkNode("img|audio|video", elt)) return true;
				}
			}
			vOpt.onclone = function (doc, elt){
				if (slideshow.fFileSystem) elt.classList.add("fileSystemPreview");
				elt.style.visibility = "visible";
				elt.style.opacity = "1";
				scPaLib.findNodes("des:.nextImage", doc).forEach((elt) => {
					elt.style.visibility = "visible";
					elt.style.opacity = "1";
				});
				const root = scPaLib.findNode("ide:root", doc);
				root.style.visibility = "visible";
			}
		} else {
			vOpt.scale = this.fControllerImageScale.current;
			vOpt.ignoreElements = function (elt) {
				if (slideshow.fIsHome && elt.id === "root") return true;
				if (!slideshow.fIsHome && elt.id === "home") return true;
				if (scPaLib.checkNode(".ssSlide|.ssBk|.ssContainer", elt) && elt.getAttribute("aria-hidden")==="true") return true;
				if (elt.id === "zoomFrame") return true;
				if (scPaLib.checkNode("nav.tools", elt)) return true;
				if (scPaLib.checkNode("div.basket", elt)) return true;
				if (scPaLib.checkNode("div.tooltip_fra", elt)) return true;
				if (scPaLib.checkNode("footer", elt)) return true;
				if (scPaLib.checkNode("a.zoom", elt)) return true;
				if (slideshow.fFileSystem){
					if (scPaLib.checkNode("img|audio|video", elt)) return true;
				}
			}
			vOpt.onclone = function (doc, elt){
				if (slideshow.fFileSystem) elt.classList.add("fileSystemPreview");
			}
		}
		return vOpt;
	},

	/** slideshow.setDysOptions */
	setDysOptions: function (pType) {
		window.dysOptions = {
			type : pType || this.fDysOptions.type,
			storeRootKey : this.fDysOptions.storeRootKey,
			pathRoot : this.fDysOptions.pathRoot,
			pathContent : this.fDysOptions.pathContent,
			pathBtnParent : this.fDysOptions.pathBtnParent,
			pathPanelParent : this.fDysOptions.pathPanelParent,
			disable : this.fDysOptions.disable,
			defaultPanelInactive : this.fDysOptions.defaultPanelInactive,
			optNumHeadings: this.fDysOptions.optNumHeadings,
			counterFormat: this.fDysOptions.counterFormat,
			counterExcludes: this.fDysOptions.counterExcludes,
			counterMaxDepth: this.fDysOptions.counterMaxDepth,
			counterSuffix: this.fDysOptions.counterSuffix,
			optScaleH2: this.fDysOptions.optScaleH2 ? !!scPaLib.findNode("ide:toc/chi:li/chi:ul") : false,
			optAltLineColor: this.fDysOptions.optAltLineColor,
			optFontActive: this.fDysOptions.optFontActive,
			optFontSize: this.fDysOptions.optFontSize,
			defaults: this.fDysOptions.defaults,
			ignoreFilter : this.fDysOptions.ignoreFilter
		}
	},

	/** slideshow.onLoad */
	onLoad : function() {
		try{
			let i;
			this.fSldList = scPaLib.findNodes("des:.mainSlide", sc$("slideFrame"));
			for (i = 0; i < this.fSldList.length; i++) this.fBlkCount += this.fSldList[i].fSldHdr.fBlkCount;
			this.fSldCount = this.fSldList.length;

			// Add menu toggle button
			this.fTglBtn = this.xAddBtn(scPaLib.findNode(this.fBtnPath), "btnMenu", this.xGetStr(0), (this.fOpen ? this.xGetStr(2) : this.xGetStr(3)), scPaLib.findNode(this.fBtnPath+"/chi:div"));
			this.fTglBtn.onclick = this.toggleToc;

			// Add menu scroller
			new this.ScrollTask(this.fTocSrl);

			// Init slideshow navbar slideCount
			const vNavbars = scPaLib.findNodes("des:nav.tools/chi:.navbar", sc$("root"));
			for (i = 0; i < vNavbars.length; i++){
				const vNavbar = vNavbars[i];
				this.fSldCnt.push(scDynUiMgr.addElement("span", vNavbar, "slideCount", scPaLib.findNode("chl:button", vNavbar)))
			}
			this.updateSlideCounters();

			// Init altSlide navbar blockCount
			const vAltNavbars = scPaLib.findNodes("des:nav.tools/chi:.navbar", sc$("altSlides"));
			for (i = 0; i < vAltNavbars.length; i++){
				const vAltNavbar = vAltNavbars[i];
				this.fAltBlkCnt.push(scDynUiMgr.addElement("span", vAltNavbar, "blockCount", scPaLib.findNode("chl:button", vAltNavbar)))
			}

			document.body.classList.remove("loading");
			this.fReady = true;

			// Nav to specified slide
			let vParams = new URL(document.location).searchParams;
			if (vParams.get("slide")){
				const vSlideId = decodeURIComponent(vParams.get("slide"));
				if (vSlideId && this.fTocEntries[vSlideId]){
					this.start();
					this.fTocEntries[vSlideId].onclick();
				}
			}

			if (sessionStorage.getItem(scServices.scLoad.fRootUrl+"controllerOpen")) this.openController();

		} catch(e){
			console.error("ERROR - slideshow.onLoad : "+e);
		}
	},
	loadSortKey : "B",

	/** slideshow.sendCommand */
	sendCommand : function(pCmdObj){
		if (!this.fController) return;
		if (this.fController.closed){
			console.warn("Controller window closed.")
			sessionStorage.removeItem(scServices.scLoad.fRootUrl+"controllerOpen");
			document.body.classList.remove("controllerOpen");
			document.body.classList.remove("zenMode");
			document.body.classList.remove("showPointer");
			slideshow.fShowPointer = false;
			this.fController = null;
			return;
		}
		if (!pCmdObj.cmd) throw "slideshow.sendCommand : Illegal command object";
		this.fController.postMessage(JSON.stringify(pCmdObj), "*");
	},

	/** slideshow.receiveCommand */
	receiveCommand : function (pCmdObj){
		try {
			if (!pCmdObj.cmd) throw "slideshow.receiveCommand : Illegal command object";
			if(!slideshow.fController){
				console.warn("slideshow.receiveCommand : Controller handle lost");
				//slideshow.openController();
			}
			switch (pCmdObj.cmd) {
				case "init" : {
					slideshow.sendCommand({
						cmd:"init",
						toc: sc$("toc").outerHTML,
						theme: localStorage.getItem(scServices.scLoad.fRootUrl+"theme-preference")
					});
					slideshow.updateController();
					slideshow.updateControllerImages({forceNext:true});
					break;
				}
				case "imageZoneSize" : {
					slideshow.updateImageScales(pCmdObj);
					break;
				}
				case "home" : {
					slideshow.home();
					break;
				}
				case "start" : {
					slideshow.start();
					break;
				}
				case "first" : {
					scPresMgr.first();
					break;
				}
				case "next" : {
					scPresMgr.next(pCmdObj.skip);
					break;
				}
				case "previous" : {
					scPresMgr.previous(pCmdObj.skip);
					break;
				}
				case "gotoSlide" : {
					slideshow.fTocEntries[pCmdObj.id].click();
					break;
				}
				case "close" : {
					window.setTimeout(function (){slideshow.sendCommand({cmd:"bye"})}, 500);
					break;
				}
				case "toggleZen" : {
					slideshow.toggleZen();
					break;
				}
				case "toggleToc" : {
					if (!this.fIsHome) slideshow.toggleToc();
					break;
				}
				case "showPointer" : {
					document.body.classList.add("showPointer");
					slideshow.fShowPointer = true;
					break;
				}
				case "hidePointer" : {
					document.body.classList.remove("showPointer");
					slideshow.fShowPointer = false;
					break;
				}
				case "updatePointer" : {
					slideshow.updatePointer(pCmdObj.left, pCmdObj.top);
					break;
				}
				case "clickPointer" : {
					slideshow.clickPointer()
					break;
				}
				default : {
					console.warn("Unknown command : " + pCmdObj.cmd);
				}
			}
			this.notifyListeners("onCommand", pCmdObj);
		} catch (e) {
			console.error("ERROR - slideshow.sendCommand : " + e);
		}
	},

	start : function(){
		if (!this.fReady) return;
		this.fIsHome = false;
		document.body.classList.add("showSlideshow");
		document.body.classList.remove("showHome");
		if (this.fCurrentSld) history.replaceState(null, null, scCoLib.hrefBase() + "?slide=" + this.fCurrentSld.id);
		window.setTimeout(function(){scPresMgr.toggleKeyboardNavigation(true)}, 10);
		slideshow.updateController();
		slideshow.updateControllerImages();
	},

	home : function(){
		this.fIsHome = true;
		document.body.classList.add("showHome");
		document.body.classList.remove("showSlideshow");
		history.replaceState(null, null, scCoLib.hrefBase());
		scPresMgr.toggleKeyboardNavigation(false);
		scPresMgr.loadSlide(scPresMgr.fFirstLocalIdx, true, true);
		slideshow.updateController();
		slideshow.updateControllerImages();
	},

	updatePointer : function (pLeft, pTop) {
		if (!this.fShowPointer) return;
		const vRefElt = this.fShowZoom ? sc$("zoomFrame") : this.fIsHome ? sc$("home") : scPresMgr.getCurrSlide();
		const vPointer = sc$("pointer");
		this.fPointerLeft = Math.round(pLeft / this.fControllerImageScale.current + scSiLib.getOffsetLeft(vRefElt, document.body));
		this.fPointerTop = Math.round(Math.min(pTop / this.fControllerImageScale.current, vRefElt.clientHeight) + scSiLib.getOffsetTop(vRefElt, document.body));
		vPointer.style.left = Math.round(this.fPointerLeft - vPointer.clientWidth / 2) + "px";
		vPointer.style.top = Math.round(this.fPointerTop - vPointer.clientHeight / 2) + "px";
	},

	clickPointer : function () {
		sc$("pointer").classList.remove("clicked");
		sc$("pointer").style.display = "none";
		const vTarget = document.elementFromPoint(this.fPointerLeft, this.fPointerTop);
		if (vTarget.getAttribute("usemap")){
			const vTargetRect = vTarget.getBoundingClientRect();
			const vPointerLeft = this.fPointerLeft - vTargetRect.x;
			const vPointerTop = this.fPointerTop - vTargetRect.y;
			const vAreas = scPaLib.findNodes("chi:area", document.getElementsByName(vTarget.getAttribute("usemap").substring(1))[0]);
			let vAreaFound = false
			for (let i = vAreas.length - 1; i >= 0; i--) {
				const vArea = vAreas[i];
				const vAreaCoods = vArea.getAttribute("coords").split(",").map(elem=> parseInt(elem, 10));
				switch (vArea.getAttribute("shape")){
					case "rect" :
						if (vPointerLeft >= vAreaCoods[0] && vPointerLeft <= vAreaCoods[2] && vPointerTop >= vAreaCoods[1] && vPointerTop <= vAreaCoods[3]) vAreaFound = true;
						break;
					case "circle" :
						if (vPointerLeft >= vAreaCoods[0]-vAreaCoods[2] && vPointerLeft <= vAreaCoods[0]+vAreaCoods[2] && vPointerTop >= vAreaCoods[1]-vAreaCoods[2] && vPointerTop <= vAreaCoods[1]+vAreaCoods[2]) vAreaFound = true;
						break;
					case "poly" :
						let vTopLeftX = vAreaCoods[0], vTopLeftY = vAreaCoods[1], vBottomRightX = vAreaCoods[0], vBottomRightY = vAreaCoods[1];
						for (let j = 2; j < vAreaCoods.length; j+=2) {
							vTopLeftX = Math.min(vTopLeftX, vAreaCoods[j]);
							vTopLeftY = Math.min(vTopLeftY, vAreaCoods[j+1]);
							vBottomRightX = Math.max(vBottomRightX, vAreaCoods[j]);
							vBottomRightY = Math.max(vBottomRightY, vAreaCoods[j+1]);
						}
						if (vPointerLeft >= vTopLeftX && vPointerLeft <= vBottomRightX && vPointerTop >= vTopLeftY && vPointerTop <= vBottomRightY) vAreaFound = true;
						break;
				}
				if (vAreaFound){
					vArea.click();
					break;
				}
			}
		} else if (vTarget) vTarget.click();
		this.notifyListeners("onPointerClick", vTarget);
		sc$("pointer").style.display = "";
		window.setTimeout(function (){sc$("pointer").classList.add("clicked");}, 10);
		window.setTimeout(function (){sc$("pointer").classList.remove("clicked");}, 2000);
	},

	setFontSize(pSize){
		scPresMgr.setDefaultFontSize(pSize);
		scSiLib.fireResizedNode(document.body);
	},

	toggleFullScreen : function(){
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	},

	toggleZen : function(){
		slideshow.fZenMode = !slideshow.fZenMode;
		if (slideshow.fZenMode) {
			if (slideshow.fOpen) slideshow.closeToc();
			document.body.classList.add("zenMode");
		} else {
			document.body.classList.remove("zenMode");
		}
		scSiLib.fireResizedNode(document.body);
	},

	/** Called by the toggle button - this == slideshow.fModeHtmlBtn. */
	toggleToc : function(){
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		if (slideshow.fOpen){
			slideshow.closeToc();
		} else {
			slideshow.openToc();
		}
		return false;
	},

	closeToc : function(){
		localStorage.setItem(scServices.scLoad.fRootUrl+"tocClose","true");
		document.body.classList.add("tocClose");
		this.fOpen = false;
		if (this.fTglBtn) this.fTglBtn.title = this.xGetStr(3);
		scSiLib.fireResizedNode(document.body);
	},

	openToc : function(){
		localStorage.setItem(scServices.scLoad.fRootUrl+"tocClose","false");
		document.body.classList.remove("tocClose");
		this.fOpen = true;
		if (this.fTglBtn) this.fTglBtn.title = this.xGetStr(2);
		if (this.fKeepVis) this.fKeepVis.resetNode();
		scSiLib.fireResizedNode(document.body);
	},

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
	},

	updateProgress : function(){
		if(!this.fBlkCount) return;
		let vBlkCount = 0, vBlkCurrent = 0;
		for (let i = 0; i < this.fSldList.length; i++){
			const vSlide = this.fSldList[i];
			if (vSlide === this.fCurrentSld){
				vBlkCurrent = vBlkCount + Number(vSlide.fSldHdr.getCurrBlkCounter())+1;
				break;
			}
			vBlkCount += vSlide.fSldHdr.fBlkCount;
		}
		this.fProgress = vBlkCurrent / this.fBlkCount;
		this.fProgressBar.className = this.fProgressBar.className.replace(/prog_[0-9]*/gi,"prog_" + Math.floor(this.fProgress * 20)*5);
		this.fProgressBar.title = Math.floor(this.fProgress * 100) + "%";
	},

	updateSlideCounters : function(){
		let vBlkCount = 0, vBlkCurrent = 0, vSlideBlkCount = 0, vSlideIndex = 0;
		for (let i = 0; i < this.fSldList.length; i++){
			const vSlide = this.fSldList[i];
			if (vSlide === this.fCurrentSld){
				vSlideIndex = i+1;
				vSlideBlkCount = Number(vSlide.fSldHdr.getCurrBlkCounter())+1;
				vBlkCurrent = vBlkCount + vSlideBlkCount;
				break;
			}
			vBlkCount += vSlide.fSldHdr.fBlkCount;
		}
		this.fCounterHtml = this.fCounterTemplate
			.replace("øcurrentSlideø", vSlideIndex)
			.replace("øtotalSlidesø", this.fSldCount)
			.replace("øcurrentBlockø", vBlkCurrent)
			.replace("øcurrentBlockInSlideø", vSlideBlkCount)
			.replace("øtotalBlocksø", this.fBlkCount)
			.replace("øblock%ø",Math.floor(vBlkCurrent / this.fBlkCount * 100))
			.replace("øslide%ø",Math.floor(vSlideIndex / this.fSldCount * 100));
		for (let i = 0; i < this.fSldCnt.length; i++){
			const vSldCnt = this.fSldCnt[i];
			vSldCnt.innerHTML = this.fCounterHtml;
		}
	},

	updateAltSlideBlockCounters : function(){
		const vSldHdr = scPresMgr.fAltSlides.fSldHdr;
		for (let i = 0; i < this.fAltBlkCnt.length; i++){
			const vAltBlkCnt = this.fAltBlkCnt[i];
			if(vSldHdr.getCurrBlkCounter().length!=="") vAltBlkCnt.innerHTML =  (Number(vSldHdr.getCurrBlkCounter()) + 1) + "/" + vSldHdr.fBlkCount;
		}
	},

	/** slideshow.openController */
	openController : function (){
		if (!slideshow.fControllerUrl) return;
		slideshow.fController = window.open(slideshow.fControllerUrl, 'controller', slideshow.fControllerWindowFeatures);
		sessionStorage.setItem(scServices.scLoad.fRootUrl+"controllerOpen", "true");
		document.body.classList.add("controllerOpen");
	},

	/** slideshow.updateControllerImages */
	updateControllerImages : function (pOpts) {
		if (!this.fController) return;
		if(!pOpts) pOpts = {}
		slideshow.sendCommand({cmd:"currentImagePending"});
		if (this.fShowZoom){
			html2canvas(sc$("zoomFrame"), slideshow.getControllerImageOptions()).then((canvas) => {
				slideshow.sendCommand({
					cmd: "currentImage",
					image:canvas.toDataURL("image/png"),
				});
			});
			slideshow.sendCommand({cmd:"nextImageMissing"});
			return;
		}
		html2canvas(this.fIsHome ? sc$("home"): scPresMgr.getCurrSlide(), slideshow.getControllerImageOptions()).then((canvas) => {
			slideshow.sendCommand({
				cmd: "currentImage",
				image:canvas.toDataURL("image/png"),
			});
		});
		const vNextBlock = this.fIsHome ? scPresMgr.getCurrBlock() : scPresMgr.getNextBlock();
		if (vNextBlock && (vNextBlock !== this.fNextBlock || pOpts.forceNext)){
			slideshow.sendCommand({cmd:"nextImagePending"});
			const vNextSlide = scPaLib.findNode("anc:.ssSlide", vNextBlock);
			vNextBlock.classList.add("nextImage");
			vNextSlide.classList.add("nextImage");
			scPaLib.findNodes("anc:.ssContainer", vNextBlock).forEach((elt) => {elt.classList.add("nextImage")});
			html2canvas(vNextSlide, slideshow.getControllerImageOptions(true)).then((canvas) => {
				slideshow.sendCommand({
					cmd: "nextImage",
					image:canvas.toDataURL("image/png"),
				});
				scPaLib.findNodes("des:.nextImage", sc$("root")).forEach((elt) => {elt.classList.remove("nextImage")});
			});
			this.fNextBlock = vNextBlock;
		} else if (!vNextBlock){
			slideshow.sendCommand({cmd:"nextImageMissing"});
			this.fNextBlock = null;
		}
	},

	/** slideshow.updateController */
	updateController : function () {
		if (!this.fController) return;
		this.sendCommand({
			cmd: "update",
			sldId: this.fCurrentSld ? this.fCurrentSld.id : null,
			counter: this.fCounterHtml,
			prog: this.fProgress,
			isHome: this.fIsHome,
			zenMode: this.fZenMode,
			hasNext: scPresMgr.hasNext(),
			hasPrevious: scPresMgr.hasPrevious(),
			theme: localStorage.getItem(scServices.scLoad.fRootUrl+"theme-preference"),
		});
	},

	/** slideshow.onHpsKeyPress : listener : this == function */
	onHpsKeyPress : function(pCharCode) {
		switch(pCharCode){
			case 77://m
				slideshow.toggleToc();break;
		}
	},

	/** slideshow.onHpsBlkShow : listener : this == function */
	onHpsBlkShow : function(pBlk) {
		try{
			if(scPresMgr.fAltSlides.fAct) slideshow.updateAltSlideBlockCounters();
			else {
				slideshow.updateProgress();
				slideshow.updateSlideCounters();
			}
			slideshow.updateController();
		}catch(e){console.error("ERROR - slideshow.onBlkShow : "+e)}
	},

	/** slideshow.onHpsSldShow : listener : this == function */
	onHpsSldShow : function(pSld) {
		try{
			let i;
			slideshow.fCurrentSld = pSld;

			// ## Menu management
			if (slideshow.fCurrentEntry) slideshow.fCurrentEntry.classList.remove("selected");
			slideshow.fCurrentEntry = slideshow.fTocEntries[pSld.id];
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
			if (slideshow.fKeepVis) slideshow.fKeepVis.resetNode();
			scSiLib.fireResizedNode(slideshow.fTocSrl);

			// ## URL management
			if (!slideshow.fIsHome && slideshow.fTocEntries[pSld.id]){
				history.replaceState(null, null, scCoLib.hrefBase() + "?slide=" + pSld.id);
			}

			slideshow.updateProgress();
			slideshow.updateSlideCounters();
			slideshow.updateController();
		}catch(e){console.error("ERROR - slideshow.onSldShow : "+e)}
	},

	/** slideshow.onHpsAction : listener : this == function */
	onHpsAction : function(pAct) {
		//console.log("slideshow.onHpsAction : " + pAct);
		try{
			if(pAct==="showAltSlide"){
				if(scPresMgr.fAltSlides.fAct) slideshow.updateAltSlideBlockCounters();
			}
			if(pAct==="next" || pAct==="previous"){
				slideshow.updateController();
				window.setTimeout(function (){
					slideshow.updateControllerImages();
				}, slideshow.fControllerImageDelay);
			}
			if(pAct==="showAltSlide" || pAct==="hideAltSlide" || pAct==="showAltBlock" || pAct==="hideAltBlock" || pAct==="loadSlide"){
				window.setTimeout(function (){
					slideshow.updateControllerImages();
				}, slideshow.fControllerImageDelay);
			}
			if(pAct==="showZoom"){
				slideshow.fShowZoom = true;
				window.setTimeout(function (){
					slideshow.updateControllerImages();
				}, slideshow.fControllerImageDelay);
			}
			if(pAct==="hideZoom"){
				slideshow.fShowZoom = false;
				window.setTimeout(function (){
					slideshow.updateControllerImages({forceNext:true});
				}, slideshow.fControllerImageDelay);
			}
			if ("scTooltipMgr" in window) scTooltipMgr.hideTooltip();
		}catch(e){console.error("ERROR - slideshow.onAction : "+e)}
	},

	/** slideshow.resizeHome  */
	resizeHome : function() {
		const vBaseFontSize = Math.round(Math.sqrt(this.fHome.offsetHeight / 600 * this.fHome.offsetWidth / 800) * scPresMgr.fDefaultFontSize);
		this.fHome.style.fontSize = vBaseFontSize+"px";
	},

	/** slideshow.jsmindOnResize  */
	jsmindOnResize : function (pOwnerNode, pEvent) {
		if(pEvent.phase===1) {
			try{
				const vObj = pOwnerNode.fObj;
				if(!vObj) return;
				if (!vObj.oriW){
					const vSvg = scPaLib.findNode("des:svg", vObj);
					vObj.oriW = vSvg.width.baseVal.value || 800;
					vObj.oriH = vSvg.height.baseVal.value || 600;
				}
				const vIsAlone = !this.isEltNotAlone(pOwnerNode.fSldMgr.findOwnerBlk(pOwnerNode), pOwnerNode);
				const vWantedW =vObj.oriW;
				const vWantedH = vObj.oriH;
				const vMaxW = Math.round(pOwnerNode.fHdr.getAvailWidth() * (this.fOpt.ratioWidth || .8));
				const vMaxH = Math.round(pOwnerNode.fHdr.getAvailHeight() * (vIsAlone ? (this.fOpt.ratioHeightAlone || .9) : (this.fOpt.ratioHeight || .8)) - (this.fOpt.captionHeight || 30));
				pOwnerNode.fZoomOn = false;
				if(vWantedW > vMaxW || vWantedH > vMaxH) {
					const vRW = vWantedW / vMaxW;
					const vRH = vWantedH / vMaxH;
					if(vRW > vRH) {
						vObj.width = Math.round(vMaxW);
						vObj.height = Math.round(vWantedH / vRW);
					} else {
						vObj.width = Math.round(vWantedW / vRH);
						vObj.height = Math.round(vMaxH);
					}
					pOwnerNode.fZoomOn = true;
				} else {
					vObj.width = Math.round(vWantedW);
					vObj.height = Math.round(vWantedH);
					pOwnerNode.fZoomOn = false;
				}
				pOwnerNode.fZoomOn = pOwnerNode.fZoomOn || this.fOpt.forceZoom;
				if(pOwnerNode.fZoom) pOwnerNode.fZoom.style.display = pOwnerNode.fZoomOn ? "" : "none";
				vObj.style.width=vObj.width+"px";
				vObj.style.height=vObj.height+"px";
				const vJm = vObj.jsMind;
				vJm.view.set_zoom(Math.max(Math.min(vObj.width/vWantedW, vJm.view.opts.zoom.max), vJm.view.opts.zoom.min));
				scSiLib.fireResizedNode(vObj);
			}catch(e){console.error("ERROR jsmindOnResize : "+e);}
		}
	},

	/** slideshow.jsmindOnZoom  */
	jsmindOnZoom : function (pEvent) {
		const vBlk = this.fBlk;
		if (!vBlk.fSldMgr || !vBlk.fSldMgr.fSldHdr) return false;
		const vSldHdr = vBlk.fSldMgr.fSldHdr;
		const vZmItm = vSldHdr.showZoom(vBlk.fObj,{type:"dyn", focusOnClose: this, buildZoom : function (pRes, pZoom) {
				const vBd = dom.newBd(pZoom);
				vBd.elt("div", "jsmindZoomFrame");
				const vId = pRes.fOptions.container = pRes.fOptions.container + "Zoom";
				const jsmindZoomElt = vBd.elt("div", "jsmindZoom").att("id", vId)	.current();
				jsmindZoomElt.style.textAlign="start";
				const jm = jsmindZoomElt.jsMind = new jsMind(pRes.fOptions);
				jm.show(pRes.fMap);
				jm.scroll_node_to_center(jm.get_root());
				return jsmindZoomElt;
			}});
		const vCt = vSldHdr.getZoomContainer();
		const vResizer = {
			onResizedDes: function (pOwnerNode, pEvent) {
			},
			onResizedAnc: function (pOwnerNode, pEvent) {
				if (pEvent && pEvent.phase === 2) return;
				const vWantedW = vBlk.fObj.oriW;
				const vWantedH = vBlk.fObj.oriH;
				const vMaxW = vCt.offsetWidth;
				const vMaxH = vCt.offsetHeight;
				if (vWantedW > vMaxW || vWantedH > vMaxH) {
					const vRW = vWantedW / vMaxW;
					const vRH = vWantedH / vMaxH;
					if (vRW > vRH) {
						vZmItm.width = Math.round(vMaxW);
						vZmItm.height = Math.round(vWantedH / vRW);
					} else {
						vZmItm.width = Math.round(vWantedW / vRH);
						vZmItm.height = Math.round(vMaxH);
					}
				} else {
					vZmItm.width = Math.round(vWantedW);
					vZmItm.height = Math.round(vWantedH);
				}
				vZmItm.style.width=vZmItm.width+"px";
				vZmItm.style.height=vZmItm.height+"px";
				const vJm = vZmItm.jsMind;
				vJm.view.set_zoom(Math.max(Math.min(vZmItm.width/vWantedW, vJm.view.opts.zoom.max), vJm.view.opts.zoom.min));
			}
		};
		scSiLib.addRule(vZmItm, vResizer);
		vResizer.onResizedAnc(vZmItm);
		return false;
	},

	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase===1) {
			this.resizeHome();
			this.updateController();
			this.updateControllerImages({forceNext:true});
		}
	},
	onResizedDes : function(pOwnerNode, pEvent) {
	},
	/** slideshow.ruleSortKey : Api scSiLib. */
	ruleSortKey : "AAA",

	/* === Utilities ========================================================== */
	/** slideshow.xAddBtn : Add an HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		const vBtn = pParent.ownerDocument.createElement("button");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		if (pTitle) vBtn.setAttribute("title", pTitle);
		vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	/** Retrieve a string. */
	xGetStr: function(pStrId) {
		return this.fStrings[pStrId];
	},
	/** Retrieve a sOnKeyUp. */
	sOnKeyUp: function(pEvt) {
		const vKey = pEvt.key.toLowerCase();
		//console.log(`key: ${vKey}`)
		switch(vKey) {
			case "f"://f
				slideshow.toggleFullScreen();break;
			case "d"://D
			case "h"://H
				if (slideshow.fIsHome) return;
				slideshow.home();
				return;
			case " "://space
			case "arrowright"://→
			case "arrowdown"://↓
			case "c"://C
			case "n"://N
			case "s"://S
				if (!slideshow.fIsHome) return;
				slideshow.start();
				return;
			case "r"://R
				if (!slideshow.fController) slideshow.openController();
				break;
			case "z"://Z
				slideshow.toggleZen();
				break;
		}
	}
}
slideshow.ScrollTask = function (pScrollNode) {
	this.fScrollNode = pScrollNode;
	this.fScrollNode.fMgr = this;
	this.fScrollNode.style.overflow="hidden";

	// Add Scroll up button
	this.fSrlUp = scDynUiMgr.addElement("div", pScrollNode.parentNode, "tocSrlUp", pScrollNode);
	this.fSrlUp.fMgr = this;
	this.fSrlUp.onclick = function(){
		this.fMgr.fSpeed -= 2;
	}
	this.fSrlUp.onmouseover = function(){
		if(this.fMgr.fSpeed >= 0) {
			this.fMgr.fSpeed = -2;
			scTiLib.addTaskNow(this.fMgr);
		}
	}
	this.fSrlUp.onmouseout = function(){
		this.fMgr.fSpeed = 0;
	}
	const vSrlUpBtn = slideshow.xAddBtn(this.fSrlUp, "tocSrlUpBtn", slideshow.xGetStr(4), slideshow.xGetStr(5));
	vSrlUpBtn.fMgr = this;
	vSrlUpBtn.onclick = function(){
		this.fMgr.step(-20);
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		return false;
	}
	// Add Scroll down button
	this.fSrlDwn = scDynUiMgr.addElement("div", pScrollNode.parentNode, "tocSrlDwn");
	this.fSrlDwn.fMgr = this;
	this.fSrlDwn.onclick = function(){
		this.fMgr.fSpeed += 2;
	}
	this.fSrlDwn.onmouseover = function(){
		if(this.fMgr.fSpeed <= 0) {
			this.fMgr.fSpeed = 2;
			scTiLib.addTaskNow(this.fMgr);
		}
	}
	this.fSrlDwn.onmouseout = function(){
		this.fMgr.fSpeed = 0;
	}
	const vSrlDwnBtn = slideshow.xAddBtn(this.fSrlDwn, "tocSrlDwnBtn", slideshow.xGetStr(6), slideshow.xGetStr(7));
	vSrlDwnBtn.fMgr = this;
	vSrlDwnBtn.onclick = function(){
		this.fMgr.step(20);
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		return false;
	}
	// Init scroll manager
	this.checkBtn();
	scSiLib.addRule(pScrollNode, this);
	pScrollNode.onscroll = function(){this.fMgr.checkBtn()};
	pScrollNode.onmousewheel = function(){this.fMgr.step(Math.round(-event.wheelDelta/(scCoLib.isIE ? 60 : 40)))}; //IE, Safari, Chrome, Opera.
	if(pScrollNode.addEventListener) pScrollNode.addEventListener('DOMMouseScroll', function(pEvent){this.fMgr.step(pEvent.detail)}, false);
}
slideshow.ScrollTask.prototype = {
	fClassOffUp : "btnOff",
	fClassOffDown : "btnOff",
	fSpeed : 0,
	execTask : function(){
		try {
			if(this.fSpeed === 0) return false;
			this.fScrollNode.scrollTop += this.fSpeed;
			return true;
		}catch(e){
			this.fSpeed = 0;
			return false;
		}
	},
	step: function(pPx) {
		try { this.fScrollNode.scrollTop += pPx; }catch(e){}
	},
	checkBtn: function(){
		const vScrollTop = this.fScrollNode.scrollTop;
		const vBtnUpOff = this.fSrlUp.className.indexOf(this.fClassOffUp);
		if(vScrollTop <= 0) {
			if(vBtnUpOff < 0) this.fSrlUp.className+= " "+this.fClassOffUp;
		} else {
			if(vBtnUpOff >= 0) this.fSrlUp.className = this.fSrlUp.className.substring(0, vBtnUpOff);
		}
		const vContentH = scSiLib.getContentHeight(this.fScrollNode);
		const vBtnDownOff = this.fSrlDwn.className.indexOf(this.fClassOffDown);
		if( vContentH - vScrollTop <= this.fScrollNode.offsetHeight){
			if(vBtnDownOff < 0) this.fSrlDwn.className+= " "+this.fClassOffDown;
		} else {
			if(vBtnDownOff >=0) this.fSrlDwn.className = this.fSrlDwn.className.substring(0, vBtnDownOff);
		}
	},
	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase===2) this.checkBtn();
	},
	onResizedDes : function(pOwnerNode, pEvent) {
	},
	ruleSortKey : "checkBtn"
}

slideshow.EnsureVisibleTask = function (pPathNode, pContainer) {
	//sc size rule that ensures a given node is visible in its container
	this.fPathNode = pPathNode;
	this.fContainer = pContainer;
	scOnLoads[scOnLoads.length] = this;
}
slideshow.EnsureVisibleTask.prototype = {
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
				this.fContainer.scrollTop = vCurrScrollTop - (2 * (vCurrScrollTop - this.fTargetScrollTop) / (this.fCycles + 1));
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
			this.initTask(vOffsetMiddle - vMiddle);
		} catch(e) {console.error("ERROR EnsureVisibleTask.ensureVis: "+e)}
	},
	loadSortKey : "SiZ",
	ruleSortKey : "Z"
}
