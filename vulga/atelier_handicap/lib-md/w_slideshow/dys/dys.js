window.dys = {
	fStrings : [
		/*00*/ "⚙","Options d\'accessibilité",
		/*02*/ "Police OpenDyslexic","Utiliser la police OpenDyslexic",
		/*04*/ "Lignes colorées","Lignes de texte en couleurs alternées",
		/*06*/ "","",
		/*08*/ "-","Diminuer la taille de la police",
		/*10*/ "+","Augmenter la taille de la police",
		/*12*/ "Titres numérotés","Numérotation des titres",
		/*14*/ "Titres à l\'échelle","Mise à l\'échelle des titres des pages en fonction de leur profondeur",
		/*16*/ "Appliquer une police spécifique au contenu","Police par défaut",
		/*18*/ "Police sans empattement","Police avec empattement",
		/*20*/ "Police à chasse fixe","Police %s",
		/*22*/ "","",
		""],
	fPanelActive : false,
	fFontActive : false,
	fFontSize : 22,
	fAltLineColor : false,
	fNumHeadings : false,
	fScaleH2 : false,
	fListeners : [],

	init : function(pOptions) {
		try {
			if (pOptions) this.fOptions = pOptions;
			else throw "Cannot initialize accessibility options";
			this.fStore = new this.LocalStore(this.fOptions.storeRootKey);
			this.fBody = scPaLib.findNode("bod:");
			this.fRoot = scPaLib.findNode(this.fOptions.pathRoot);
			this.fContent = scPaLib.findNode(this.fOptions.pathContent);
			scOnLoads[scOnLoads.length] = this;
		} catch (e) {
			console.error(`ERROR dys.init : ${e}`);
		}
	},
	onLoad : function() {
		try {
			if(!this.fOptions.disable) {
				if(this.fStore.get("dysFontActive")===null) this.fStore.set("dysFontActive", this.fOptions.defaults.dysFontActive);
				if(this.fStore.get("dysNumHeadings")===null && this.fOptions.defaults.dysNumHeadings) this.fStore.set("dysNumHeadings", true);
				if(this.fStore.get("dysScaleH2")===null && this.fOptions.defaults.dysScaleH2) this.fStore.set("dysScaleH2", true);
				if(this.fStore.get("dysAltLineColor")===null && this.fOptions.defaults.dysAltLineColor) this.fStore.set("dysAltLineColor", true);
				if(this.fStore.get("dysFontSize")===null && this.fOptions.defaults.dysFontSize) this.fStore.set("dysFontSize", this.fOptions.defaults.dysFontSize);
				this.xBuildUi();
				if (this.fStore.get("dysPanelActive")==="true" && !this.fOptions.defaultPanelInactive) this.xTogglePanel(scPaLib.findNode("des:button.dysBtnTogglePanel"));
				if (this.fOptions.optFontActive && this.fStore.get("dysFontActive")!=="false") this.xSetFont(this.fStore.get("dysFontActive"));
				if (this.fOptions.optFontSize && this.fStore.get("dysFontSize")){
					this.fFontSize = Number(this.fStore.get("dysFontSize"));
					slideshow.setFontSize(this.fFontSize);
					this.fFontSizeLbl.innerHTML = Math.round(this.fFontSize/0.22) + "%";
				}
				if (this.fOptions.optNumHeadings && this.fStore.get("dysNumHeadings")==="true") this.xToggleNumHeadings(scPaLib.findNode("des:button.dysBtnToggleNumHeadings"));
				if (this.fOptions.optScaleH2 && this.fStore.get("dysScaleH2")==="true") this.xToggleScaleH2(scPaLib.findNode("des:button.dysBtnToggleScaleH2"));
				if (this.fOptions.optAltLineColor && this.fStore.get("dysAltLineColor")==="true") this.xToggleAltLineColor(scPaLib.findNode("des:button.dysBtnToggleAltLineColor"));
			}
			if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		} catch (e) {
			console.error(`ERROR dys.onLoad : ${e}`);
		}
	},
	registerListener : function(pFunc){
		if (this.fListeners) this.fListeners.push(pFunc);
	},

	/* === Private ============================================================== */
	xBuildUi : function() {
		const vBtnParent = scPaLib.findNode(this.fOptions.pathBtnParent);
		const vPanelParent = scPaLib.findNode(this.fOptions.pathPanelParent);
		if (!vBtnParent || !vPanelParent) throw "Cannot find button or panel parent element.";
		const bd = dom.newBd(vBtnParent);
		bd.elt("div", "dysBtnTogglePanel").elt("button", "dysBtnToggle").att("title", this.fStrings[1]).listen("click", function() {return dys.xTogglePanel(this)}).elt("span").text(this.fStrings[0]).up().up();
		bd.setCurrent(vPanelParent);
		bd.elt("div", "dysPanel").elt("span");
		if (this.fOptions.optFontSize){
			bd.elt("span", "dysFontSizer");
			bd.elt("button", "dysBtn dysBtnFontSmaller").att("title", this.fStrings[9]).listen("click",function() {return dys.xFontSmaller()}).elt("span").text(this.fStrings[8]).up().up();
			this.fFontSizeLbl = bd.elt("span", "dysFontSizeLbl").text(Math.round(this.fFontSize/0.22) + "%").currentUp();
			bd.elt("button", "dysBtn dysBtnFontLarger").att("title", this.fStrings[11]).listen("click",function() {return dys.xFontLarger()}).elt("span").text(this.fStrings[10]).up().up().up();
		}
		if (this.fOptions.optFontActive) {
			bd.elt("select", "dysSelectFont").att("title", this.fStrings[16]).listen("change",function() {return dys.xSetFont(this.value)})
			bd.elt("option").att("value", "false").text(this.fStrings[17]).up();
			bd.elt("hr").up();
			bd.elt("option").att("value", "sans-serif").text(this.fStrings[18]).up();
			bd.elt("option").att("value", "serif").text(this.fStrings[19]).up();
			bd.elt("option").att("value", "monospace").text(this.fStrings[20]).up();
			if (this.fOptions.defaults.dysFontList.length > 0) {
				bd.elt("hr").up();
				for (let i = 0; i < this.fOptions.defaults.dysFontList.length; i++) {
					bd.elt("option").att("value", this.fOptions.defaults.dysFontList[i]).text(this.fStrings[21].replace("%s", this.fOptions.defaults.dysFontList[i])).up();
				}
			}

			if (this.fStore.get("dysFontActive") && this.fStore.get("dysFontActive")!=="false") bd.currentUp().value = this.fStore.get("dysFontActive");
			else bd.up();
		}
		if (this.fOptions.optAltLineColor) bd.elt("button", "dysBtnCheck_false dysBtnToggleAltLineColor").att("title", this.fStrings[5]).listen("click",function() {return dys.xToggleAltLineColor(this)}).elt("span").text(this.fStrings[4]).up().up();
		if (this.fOptions.optNumHeadings) bd.elt("button", "dysBtnCheck_false dysBtnToggleNumHeadings").att("title", this.fStrings[13]).listen("click",function() {return dys.xToggleNumHeadings(this)}).elt("span").text(this.fStrings[12]).up().up();
		if (this.fOptions.optScaleH2) bd.elt("button", "dysBtnCheck_false dysBtnToggleScaleH2").att("title", this.fStrings[15]).listen("click",function() {return dys.xToggleScaleH2(this)}).elt("span").text(this.fStrings[14]).up().up();
	},
	xAltLineColorInit : function() {
		const vTextNodes = [];
		const vIgnoreFilter = scPaLib.compileFilter(this.fOptions.ignoreFilter);
		const textNodeWalker = function (pNde) {
			while (pNde) {
				if (pNde.nodeType === 3) vTextNodes.push(pNde);
				else if (pNde.nodeType === 1 && !scPaLib.checkNode(vIgnoreFilter, pNde)) textNodeWalker(pNde.firstChild);
				pNde = pNde.nextSibling;
			}
		};
		textNodeWalker(this.fContent.firstChild);
		for (let i=0; i<vTextNodes.length; i++) {
			const vTextNode = vTextNodes[i];
			const vTextSplit = vTextNode.nodeValue.replace(/(\S+)/g, function (pWrd) {
				return '<span class="dysColor_">' + pWrd + '</span>';
			});
			const vHolder = scDynUiMgr.addElement("span", vTextNode.parentNode, null, vTextNode);
			vTextNode.parentNode.removeChild(vTextNode);
			vHolder.innerHTML = vTextSplit;
		}
		this.fAltLineColorSpans = scPaLib.findNodes("des:span.dysColor_", this.fContent);
		this.fAltLineColorInit = true;
		this.fAltLineLastColor=0;
		this.fAltLineLastVert=0;
		scSiLib.addRule(this.fRoot, {
			onResizedAnc:function(pOwnerNode, pEvent){
				if(pEvent.phase===1 || pEvent.resizedNode === pOwnerNode) return;
				dys.xAltLineColorUpdate();
			},
			onResizedDes:function(pOwnerNode, pEvent){
				if(pEvent.phase===1) return;
				dys.xAltLineColorUpdate();
			},
			ruleSortKey : "checkAltLineColor"
		});
		this.xAltLineColorUpdate();
	},
	xAltLineColorUpdate : function() {
		const getY = function (pElt) {
			const vStopFilter = scPaLib.compileFilter("body");
			for (var vY = 0; pElt != null && !scPaLib.checkNode(vStopFilter, pElt); vY += pElt.offsetTop, pElt = pElt.offsetParent) ;
			return vY;
		};
		for (let i=0; i<this.fAltLineColorSpans.length; i++) {
			const vSpan = this.fAltLineColorSpans[i];
			const vCurrVert = getY(vSpan) + vSpan.offsetHeight/2;
			if (vSpan.checkVisibility() && (this.fAltLineLastVert > vCurrVert+3 || this.fAltLineLastVert < vCurrVert-3)) {
				this.fAltLineLastVert = vCurrVert;
				this.fAltLineLastColor = (this.fAltLineLastColor + 1) % 3;
			}
			this.switchClass(vSpan, "dysColor_", "dysColor_"+this.fAltLineLastColor, false, false);
		}
	},
	xNumHeadingsInit : function() {
		this.fNumHeadingsInit = true;
		const iMenuWalker = function (pUl, pPrefix) {
			const vLis = scPaLib.findNodes("chi:li", pUl);
			const vDepth = pPrefix.split(".").length-1;
			let vCounter = 0;
			for (let i = 0; i < vLis.length; i++) {
				const vSource = vLis[i].classList[0];
				const vLbl = scPaLib.findNode("chi:a", vLis[i]);
				const vBd = dom.newBd(vLbl.firstChild);
				if (!dys.fOptions.counterExcludes[vSource] && vDepth <= dys.fOptions.counterMaxDepth){
					vCounter++;
					vBd.elt("span", "counter", vLbl.firstChild.firstChild).text(pPrefix + dys.xConvertCounter(vCounter, vDepth) + dys.fOptions.counterSuffix);
					const vTi = scPaLib.findNode("ide:"+vLbl.getAttribute("href").substring(1)+"/chi:section/chi:.slideBk_ti/chi:span");
					if (vTi){
						vBd.setCurrent(vTi);
						vBd.elt("span", "counter", vTi.firstChild).text(pPrefix + dys.xConvertCounter(vCounter, vDepth) + dys.fOptions.counterSuffix);
					}
				}
				if (scPaLib.findNode("chi:ul", vLis[i])) iMenuWalker(scPaLib.findNode("chi:ul", vLis[i]), pPrefix + dys.xConvertCounter(vCounter, vDepth) + ".");
			}
		}
		iMenuWalker(scPaLib.findNode("ide:toc"), "");
	},

	xTogglePanel : function(pBtn) {
		this.fPanelActive = !this.fPanelActive;
		this.switchClass(this.fBody, "dysPanelActive_"+!this.fPanelActive, "dysPanelActive_"+this.fPanelActive, true);
		this.fStore.set("dysPanelActive", this.fPanelActive);
		pBtn.setAttribute("aria-expanded", this.fPanelActive);
		return false;
	},
	xSetFont : function(pFont) {
		if (pFont==="false"){
			this.fBody.style.removeProperty("--dysFontFamily");
			this.fBody.removeAttribute("data-dysFontFamily");
			this.switchClass(this.fBody, "dysFontActive_true", "dysFontActive_false", true);
		} else {
			this.fBody.style.setProperty("--dysFontFamily", pFont);
			this.fBody.setAttribute("data-dysFontFamily", pFont);
			this.switchClass(this.fBody, "dysFontActive_false", "dysFontActive_true", true);
		}
		this.fStore.set("dysFontActive", pFont);
		this.xFireEvent("xSetFont");
	},
	xToggleAltLineColor : function(pBtn) {
		this.fAltLineColor = !this.fAltLineColor;
		if (!this.fAltLineColorInit) {
			if ("mathjaxMgr" in window){
				if (mathjaxMgr.fActive && !mathjaxMgr.fReady) mathjaxMgr.register(function(){dys.xAltLineColorInit();});
				else dys.xAltLineColorInit();
			} else dys.xAltLineColorInit();
		}
		if (pBtn) {
			dys.switchClass(pBtn, "dysBtnCheck_"+!this.fAltLineColor, "dysBtnCheck_"+this.fAltLineColor);
			pBtn.setAttribute("aria-pressed", this.fAltLineColor);
		}
		this.switchClass(this.fBody, "dysAltLineColor_"+!this.fAltLineColor, "dysAltLineColor_"+this.fAltLineColor, true);
		this.fStore.set("dysAltLineColor", this.fAltLineColor);
		this.xFireEvent("xToggleAltLineColor");
	},
	xFontSmaller : function() {
		this.fFontSize -= 2;
		this.fFontSize = Math.max(this.fFontSize, 10);
		slideshow.setFontSize(this.fFontSize);
		this.fStore.set("dysFontSize", this.fFontSize);
		if (this.fFontSizeLbl) this.fFontSizeLbl.innerHTML = Math.round(this.fFontSize/0.22) + "%";
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xFontSmaller");
	},
	xFontLarger : function() {
		this.fFontSize += 2;
		this.fFontSize = Math.min(this.fFontSize, 36);
		slideshow.setFontSize(this.fFontSize);
		this.fStore.set("dysFontSize", this.fFontSize);
		if (this.fFontSizeLbl) this.fFontSizeLbl.innerHTML = Math.round(this.fFontSize/0.22) + "%";
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xFontLarger");
	},
	xToggleNumHeadings : function(pBtn) {
		this.fNumHeadings = !this.fNumHeadings;
		if (pBtn) {
			this.switchClass(pBtn, "dysBtnCheck_"+!this.fNumHeadings, "dysBtnCheck_"+this.fNumHeadings);
			pBtn.setAttribute("aria-pressed", this.fNumHeadings);
		}
		this.switchClass(this.fBody, "dysNumHeadings_"+!this.fNumHeadings, "dysNumHeadings_"+this.fNumHeadings, true);
		this.fStore.set("dysNumHeadings", this.fNumHeadings);
		if (!this.fNumHeadingsInit) {
			this.xNumHeadingsInit();
		}
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xToggleNumHeadings");
	},
	xToggleScaleH2 : function(pBtn) {
		this.fScaleH2 = !this.fScaleH2;
		if (pBtn) {
			this.switchClass(pBtn, "dysBtnCheck_"+!this.fScaleH2, "dysBtnCheck_"+this.fScaleH2);
			pBtn.setAttribute("aria-pressed", this.fScaleH2);
		}
		this.switchClass(this.fBody, "dysScaleH2_"+!this.fScaleH2, "dysScaleH2_"+this.fScaleH2, true);
		this.fStore.set("dysScaleH2", this.fScaleH2);
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xToggleScaleH2");
	},

	xFireEvent : function(pParam){
		for (let i=0; i< this.fListeners.length; i++) this.fListeners[i](pParam);
	},

	xConvertCounter(pCount, pDepth){
		const sFormatters = {
			"1" : function(pNum){return pNum},
			"A" : function(pNum){return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(pNum-1)},
			"a" : function(pNum){return sFormatters["A"](pNum).toLowerCase()},
			"I" : function(pNum){
				const romanValues = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
				let roman = "";
				for (let key in romanValues) {
					while (pNum >= romanValues[key]) {
						roman += key;
						pNum -= romanValues[key];
					}
				}
				return roman;
			},
			"i" : function(pNum){return sFormatters["I"](pNum).toLowerCase()},
		};
		let vFormat = this.fOptions.counterFormat.charAt(pDepth) || this.fOptions.counterFormat.charAt(this.fOptions.counterFormat.length-1) || "1";
		if (!sFormatters[vFormat]) vFormat = "1";
		return sFormatters[vFormat](pCount);
	},

	/* === Utilities ============================================================ */

	/** dys.switchClass - replace a class name. */
	switchClass : function(pNode, pClassOld, pClassNew, pAddIfAbsent, pMatchExact) {
		const vAddIfAbsent = typeof pAddIfAbsent == "undefined" ? false : pAddIfAbsent;
		const vMatchExact = typeof pMatchExact == "undefined" ? true : pMatchExact;
		const vClassName = pNode.className;
		const vReg = new RegExp("\\b" + pClassNew + "\\b");
		if (vMatchExact && vClassName.match(vReg)) return;
		let vClassFound = false;
		if (pClassOld && pClassOld !== "") {
			if (vClassName.indexOf(pClassOld)===-1){
				if (!vAddIfAbsent) return;
				else if (pClassNew && pClassNew !== '') pNode.className = vClassName + " " + pClassNew;
			} else {
				const vCurrentClasses = vClassName.split(' ');
				const vNewClasses = [];
				let i = 0;
				const n = vCurrentClasses.length;
				for (; i < n; i++) {
					const vCurrentClass = vCurrentClasses[i];
					if (vMatchExact && vCurrentClass !== pClassOld || !vMatchExact && vCurrentClass.indexOf(pClassOld) < 0) {
						vNewClasses.push(vCurrentClasses[i]);
					} else {
						if (pClassNew && pClassNew !== '') vNewClasses.push(pClassNew);
						vClassFound = true;
					}
				}
				pNode.className = vNewClasses.join(' ');
			}
		}
		return vClassFound;
	},
	LocalStore : function(pRootKey, pId){
		if (pId && !/^[a-z][a-z0-9]+$/.exec(pId)) throw new Error("Invalid store name");
		this.fId = pId || "";
		this.fRootKey = pRootKey!==null ? pRootKey : scServices.scLoad.fRootUrl;
		if ("localStorage" in window && typeof window.localStorage != "undefined") {
			this.get = function(pKey) {
				const vRet = localStorage.getItem(this.fRootKey + this.xKey(pKey));return (typeof vRet == "string" ? unescape(vRet) : null)};
			this.set = function(pKey, pVal) {localStorage.setItem(this.fRootKey+this.xKey(pKey), escape(pVal))};
		} else {
			this.get = function(pKey){
				const vReg = new RegExp(this.xKey(pKey) + "=([^;]*)");
				const vArr = vReg.exec(document.cookie);if(vArr && vArr.length===2) return(unescape(vArr[1]));else return null};
			this.set = function(pKey,pVal){document.cookie = this.xKey(pKey)+"="+escape(pVal)};
		}
		this.xKey = function(pKey){return this.fId + this.xEsc(pKey)};
		this.xEsc = function(pStr){return "LS" + pStr.replace(/ /g, "_")};
	},
	loadSortKey : "ZZZZ"
}
dys.init(dysOptions);