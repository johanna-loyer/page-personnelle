/**
 * LICENCE[[
 * Version: MPL 2.0/GPL 3.0/LGPL 3.0/CeCILL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is kelis.fr code.
 *
 * The Initial Developer of the Original Code is
 * samuel.monsarrat@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2009-2026
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * sylvain.spinelli@kelis.fr
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 3.0 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 3.0 or later (the "LGPL"),
 * or the CeCILL Licence Version 2.1 (http://www.cecill.info),
 * in which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL, the LGPL or the CeCILL, and not to allow
 * others to use your version of this file under the terms of the MPL, indicate
 * your decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL, the LGPL or the CeCILL. If you do not
 * delete the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL, the LGPL or the CeCILL.
 * ]]LICENCE
 */

/** SCENARI Html Presentation System.
    scHPS : general package containing utility functions and objects */
window.scHPS = {
	/* Default paths */
	fCoFilter : ".ssContainer",
	fIgnoreFilter : ".ssIgnore",
	fCoBlocksRootFilter : ".ssBkRoot",
	fCoBlocksRootPath : "des:.ssBkRoot",
	fCoAltBlocksRootFilter : ".ssBkRootAlt",
	fCoAltBlocksRootPath : "chi:.ssBkRootAlt",
	fCoAltBlocksMenuPath : "des:.ssAltBlockMenu/des:.ssAltBlockMenuItem",
	fBlkCoPath : "des:.ssBkCo",
	fCutableFilter : ".ssCutable|p|ol|ul|li|table|tr|pre",
	fUncutableFilter : ".ssUncutable|tr",
	fForcedCutFilter : ".ssForcedCut",
	fFixedHeightFilter : ".ssFixedHeight",

	/* raccourcis claviers par défaut */
	fKeyMap : {nextStep:["key_right","key_down"," ","n","key_pageDown"],
		previousStep:["\b","key_left","key_up","p","key_pageUp"],
		nextSlide:"t",
		previousSlide:"s",
		home:"key_home",
		closeZoom:["key_escape", "key_delete"]},

	/* Constantes de stylage */
	fSlideClass : "ssSlide",

	/* Constantes pour les animations */
	/** Largeur mini du slide */
	fBlkMinWidth : 500,
	/** Ratio de marge max par rapport à la largeur du container */
	fBlkMaxMargin : 0.2,
	/** Ratio d'espace libre à placer au-dessus du contenu */
	fBlkTopSpace : 0.3,
	/** Opacité pour les masks des steps. */
	fStepMaskOpacity : 0.9,
	fStepMaskOpacityPrv : 0.9,
	fStepMaskOpacityNxt : 0.9,

	/** default slide constants */
	fDefaultFontSize : 22, // fontSize in pixels par défaut pour un viewport de 800x600
	fFontAutoZoomDecrment : 5, // décréments de réduction automatique de la font en %
	fFontAutoZoomSteps : 3, // nombre d'étapes de réduction automatique de la font par décréments de fFontAutoZoomDecrment % (3 = 85%)
	fBlksPath : "des:.ssBkRoot",
	fSsClassPrefix : "sld",
	fDefaultAnimStep : 5000,
	fVisibilityDelay : 700, //Ms

	/** base constants */
	fScreenTouch : ("ontouchstart" in window && ((/iphone|ipad/gi).test(navigator.appVersion) || (/android/gi).test(navigator.appVersion))),
	fDisabled : true,

	fStrings : [
		/*00*/ "Précédent","Précédent (flèche gauche)",
		/*02*/ "Suivant","Suivant (flèche droite)",
		/*04*/ "Fermer","Fermer le zoom (Suppr)",
		/*06*/ "précédent","image précédente",
		/*08*/ "suivant","image suivante",
		/*10*/ "lancer","lancer l\'animation",
		/*12*/ "arrêter","arrêter l\'animation",
		/*14*/ "chargement en cours...","",
	],

	/* --- Public ------------------------------------------------------------- */
	/** scHPS.init : MUST be called before any other scHPS interaction */
	init : function() {
		try{
			// Sanity checks...
			if (!("scPaLib" in window)) throw "scPaLib.js not present in presentation window.";
			if (!("scSiLib" in window)) throw "scSiLib.js not present in presentation window.";
			if (!("scTiLib" in window)) throw "scTiLib.js not present in presentation window.";
			if (!("scDynUiMgr" in window)) throw "scDynUiMgr.js not present in presentation window.";
			if ("wakeLock" in navigator){
				let wakeLock = null;
				const requestWakeLock = async () => {
					try {
						wakeLock = await navigator.wakeLock.request('screen');
					} catch (e) {
						console.error("ERROR scHPS.init - wakeLock : " + e)
					}
				}
				const handleVisibilityChange = () => {
					if (wakeLock !== null && document.visibilityState === 'visible') {
						requestWakeLock();
					}
				}
				document.addEventListener('visibilitychange', handleVisibilityChange);
				requestWakeLock();
			}
			this.fDisabled = false;
		} catch(e){console.error("ERROR scHPS.init : " + e);}
	},
	/* --- Private ------------------------------------------------------------ */
	/** scHPS.xGetStr : Retrieve a string. */
	xGetStr: function(pStrId) {
		return this.fStrings[pStrId];
	},
	/** scHPS.xProcessKeyMap : Return an interpreted keymap object. */
	xProcessKeyMap: function(pMap) {
		let i, vAction, vKeys;
		const vMap = {};
		const xKeyCode = function (pStr) {
			if (!pStr || pStr.length === 0) return 0;
			switch (pStr) {
				case "key_right" :
					return 39;
				case "key_left" :
					return 37;
				case "key_up" :
					return 38;
				case "key_down" :
					return 40;
				case "key_pageUp" :
					return 33;
				case "key_pageDown" :
					return 34;
				case "key_home" :
					return 36;
				case "key_escape" :
					return 27;
				case "key_delete" :
					return 46;
				default:
					return pStr.toUpperCase().charCodeAt(0);
			}
		};
		for (vAction in pMap) {
			vKeys = pMap[vAction];
			if (typeof vKeys == "object"){
				for (i = 0; i < vKeys.length; i++){
					vMap[String(xKeyCode(vKeys[i]))] = vAction;
				}
			} else if (vKeys) vMap[String(xKeyCode(vKeys))] = vAction;
		}
		return vMap;
	},

	/* --- Static ------------------------------------------------------------- */
	/** scHPS.sOnKeyUp : key event manager. */
	sOnKeyUp : function(pEvt, pMgr){
		const vCharCode = pEvt.which || pEvt.keyCode;
		return pMgr.xKeyMgr(vCharCode);
	},
	/** scHPS.sOnKeyDown : key down event manager. */
	sOnKeyDown : function(pEvt){
		const vCharCode = pEvt.which || pEvt.keyCode;
		switch(vCharCode){
			case 32: case 33: case 34: case 35: case 36: // Space,  PgUp, PgDn, End, Home
			case 37: case 39: case 38:  case 40: // Arrow keys
				pEvt.preventDefault ? pEvt.preventDefault() : pEvt.returnValue = false; break; // disable all window scrolling keys
			default: break; // do not block other keys
		}
	},
	/** scHPS.sTouchMgr : touch event manager this = PresMgr */
	sTouchMgr : function(pEvt){
		switch(pEvt.type) {
			case "touchstart":
				if(pEvt.touches.length === 1){
					this.fSwipeStart = {x:pEvt.touches[0].pageX,y:pEvt.touches[0].pageY};
					this.fSwipeEnd = this.fSwipeStart;
				}
				break;
			case "touchmove":
				pEvt.preventDefault()
				if(pEvt.touches.length === 1){
					this.fSwipeEnd = {x:pEvt.touches[0].pageX,y:pEvt.touches[0].pageY};
				}
				break;
			case "touchend":
				try{ //Swipe left & right to change page (delta Y < 30% & delta X > 100px)
					const vDeltaX = this.fSwipeStart.x - this.fSwipeEnd.x;
					if (Math.abs((this.fSwipeStart.y - this.fSwipeEnd.y)/vDeltaX) < 0.3){
						if (vDeltaX > 100) this.next();
						else if(vDeltaX <- 100) this.previous();
					}
					this.fSwipeStart = {x:null,y:null};
					this.fSwipeEnd = this.fSwipeStart;
				} catch(e){}
		}
	},

	/* --- Utilities ---------------------------------------------------------- */
	/** scHPS.xAddBtn : Add an HTML button to a parent node.
	 * @param pParent : parent node of the button.
	 * @param pMgr : object - manager object that may be used in pFunc.
	 * @param pFunc : function - static function to call when button it pressed (should return false).
	 * @param pClassName : string - button class name.
	 *  @param pCapt : string - button caption.
	 * @param pTitle : string - button title
	 * @param pNxtSib (optional) : node to insert button before.
	 * @return button node. */
	xAddBtn : function(pParent, pMgr, pFunc, pClassName, pCapt, pTitle, pNxtSib) {
		const vBtn = pParent.ownerDocument.createElement("button");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.fMgr = pMgr;
		vBtn.onclick = pFunc;
		if (pTitle) vBtn.setAttribute("title", pTitle);
		vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	/** scHPS.xSetOpacity : Set the opacity of a given node.
	 * @param pNode
	 * @param pRate Variable de 0 à 1. */
	xSetOpacity: function(pNode, pRate){
		pNode.style.opacity = pRate;
	},
	/** scHPS.xStartOpacityEffect : Start the opacity of a given node.
	 * On ajoute le filtre d'opacité sur IE.
	 * On place le node en visibility: "".
	 * @param pNode
	 * @param pRate 2 valeurs possibles: 0 (invisible) ou 1 (visible). */
	xStartOpacityEffect: function(pNode, pRate){
		pNode.style.opacity = pRate;
		pNode.style.visibility = "";
		pNode.removeAttribute("aria-hidden");
	},
	/** scHPS.xEndOpacityEffect : End the opacity of a given node.
	 * On supprime le filtre d'opacité sur IE (évite des bugs de refresh).
	 * On place le node en visibility : hidden.
	 * @param pNode
	 * @param pRate 2 valeurs possibles : 0 (invisible) ou 1 (visible)
	 * @param pHideNow	*/
	xEndOpacityEffect: function(pNode, pRate, pHideNow){
		if(pRate === 0) {
			pNode.setAttribute("aria-hidden", "true");
			if (pHideNow) pNode.style.visibility = "hidden";
			else window.setTimeout(function () {pNode.style.visibility = "hidden";}, scHPS.fVisibilityDelay);
		} else {
			pNode.removeAttribute("aria-hidden");
			pNode.style.visibility = "";
		}
		pNode.style.opacity = pRate;
	},
	xImportDeepNode: function(pEltSrc, pDocDst, pParentDst) {
		const vElt = pDocDst.importNode(pEltSrc, true);
		if(pParentDst) pParentDst.appendChild(vElt);
		return vElt;
	},
	xGetOffsetTop: function(pNode, pContainer) {
		if (pNode === pContainer) return 0;
		return scSiLib.getOffsetTop(pNode, pContainer);
	}
}
/* === Generic Utility Classes ============================================== */
/** scHPS.FadeEltTask : Task that fades a given element in or out.
 * @param pElt : element to fade.
 * @param pDir : int - fade direction : 0=out, 1=in. */
scHPS.FadeEltTask = function(pElt,pDir){
	try{
		this.fElt = pElt;
		this.fDir = (pDir >= 1 ? 1 : 0);
		scHPS.xEndOpacityEffect(this.fElt, this.fDir);
	}catch(e){console.error("ERROR scHPS.FadeEltTask : "+e);}
}

/* =============================================================================
	 * Managers
	 * ========================================================================== */

/** == scHPS.PresMgr : Presentation manager class ==============================
 * @param pSldFraPath : string - path to the slide frame.
 * @param pNavPath : string - path to the navigation bars.
 * @param pTocLnksPath : string - path to all toc entries.
 * @param pIsMaster : boolean - true = PresMgr is master on current page (optional). */
scHPS.PresMgr = function(pSldFraPath, pNavPath, pTocLnksPath, pIsMaster){
	if (scHPS.fDisabled) return;
	this.fOwnerWindow = window;
	this.fSldFraPath = pSldFraPath;
	this.fNavPath = pNavPath;
	this.fTocLnksPath = pTocLnksPath || null;
	this.fIsMaster = (typeof pIsMaster == "undefined" ? true :  pIsMaster);
	// Init default paths & classes
	this.fCoFilter = scHPS.fCoFilter;
	this.fIgnoreFilter = scHPS.fIgnoreFilter;
	this.fCoBlocksRootFilter = scHPS.fCoBlocksRootFilter;
	this.fCoBlocksRootPath = scHPS.fCoBlocksRootPath;
	this.fCoAltBlocksRootFilter = scHPS.fCoAltBlocksRootFilter;
	this.fCoAltBlocksRootPath = scHPS.fCoAltBlocksRootPath;
	this.fCoAltBlocksMenuPath = scHPS.fCoAltBlocksMenuPath;
	this.fBlkCoPath = scHPS.fBlkCoPath;
	this.fCutableFilter = scHPS.fCutableFilter;
	this.fUncutableFilter = scHPS.fUncutableFilter;
	this.fForcedCutFilter = scHPS.fForcedCutFilter;
	this.fFixedHeightFilter = scHPS.fFixedHeightFilter;
	this.fSlideClass = scHPS.fSlideClass;
	this.fSsClassPrefix = scHPS.fSsClassPrefix;
	// Init constants
	this.fFontAutoZoomDecrment = scHPS.fFontAutoZoomDecrment;
	this.fFontAutoZoomSteps = scHPS.fFontAutoZoomSteps;
	this.fDefaultFontSize = scHPS.fDefaultFontSize;
	// Init default behaviours
	this.fKeyMap = scHPS.xProcessKeyMap(scHPS.fKeyMap);
	this.fKeyActive = true;
	// Init slide rules
	this.fSldRules = [];
	//Init Listeners
	this.fListeners = {};
	this.fListeners['onSldShow'] = [];
	this.fListeners['onSldRestart'] = [];
	this.fListeners['onBlkShow'] = [];
	this.fListeners['onStpShow'] = [];
	this.fListeners['onKeyPress'] = [];
	this.fListeners['onAction'] = [];
	//Init liste elements stylés avec la position actuelle dans le slide-show (FirstSlide LastSlide, FirstStep, LastStep)
	this.fSldPosStyledElts = [];
	scOnLoads[scOnLoads.length] = this;
}
scHPS.PresMgr.prototype = {
	/* --- fields ------------------------------------------------------------- */
	fCurrSld : null,
	/* --- Public ------------------------------------------------------------- */
	/** PresMgr.initContainerFilter
			Must be called before onLoad() */
	initContainerFilter : function(pContainerFilter) {
		this.fCoFilter = pContainerFilter;
	},
	/** PresMgr.initIgnoreFilter
			Must be called before onLoad() */
	initIgnoreFilter : function(pIgnoreFilter) {
		this.fIgnoreFilter = pIgnoreFilter;
	},
	/** PresMgr.initCutableFilter
			Must be called before onLoad() */
	initCutableFilter : function(pCutableFilter) {
		this.fCutableFilter = pCutableFilter;
	},
	/** PresMgr.initForcedCutFilter
			Must be called before onLoad() */
	initForcedCutFilter : function(pForcedCutFilter) {
		this.fForcedCutFilter = pForcedCutFilter;
	},
	/** PresMgr.initUncutableFilter
			Must be called before onLoad() */
	initUncutableFilter : function(pUncutableFilter) {
		this.fUncutableFilter = pUncutableFilter;
	},
	/** PresMgr.initFixedHeightFilter
			Must be called before onLoad() */
	initFixedHeightFilter : function(pFixedHeightFilter) {
		this.fFixedHeightFilter = pFixedHeightFilter;
	},
	/** PresMgr.initContainerBlocksRootFilter
			Must be called before onLoad() */
	initContainerBlocksRootFilter : function(pContainerBlocksRootFilter) {
		this.fCoBlocksRootFilter = pContainerBlocksRootFilter;
	},
	/** PresMgr.initContainerBlocksRootPath
			Must be called before onLoad() */
	initContainerBlocksRootPath : function(pContainerBlocksRootPath) {
		this.fCoBlocksRootPath = pContainerBlocksRootPath;
	},
	/** PresMgr.initContainerAlternativeBlocksRootFilter
			Must be called before onLoad() */
	initContainerAlternativeBlocksRootFilter : function(pContainerAlternativeBlocksRootFilter) {
		this.fCoAltBlocksRootFilter = pContainerAlternativeBlocksRootFilter;
	},
	/** PresMgr.initContainerAlternativeBlocksRootPath
			Must be called before onLoad() */
	initContainerAlternativeBlocksRootPath : function(pContainerAlternativeBlocksRootPath) {
		this.fCoAltBlocksRootPath = pContainerAlternativeBlocksRootPath;
	},
	/** PresMgr.initContainerAlternativeBlocksRootPath
			Must be called before onLoad() */
	initContainerAlternativeBlocksMenuPath : function(pContainerAlternativeBlocksMenuPath) {
		this.fCoAltBlocksMenuPath = pContainerAlternativeBlocksMenuPath;
	},
	/** PresMgr.initBlockContentPath
			Must be called before onLoad() */
	initBlockContentPath : function(pBlkCoPath) {
		this.fBlkCoPath = pBlkCoPath;
	},
	/** PresMgr.initSlideClass
			Must be called before onLoad() */
	initSlideClass : function(pSlideClass) {
		this.fSlideClass = pSlideClass;
	},
	/** PresMgr.initZoomPaths : Set paths of elements that constitute the zoom frame.
			Must be called before onLoad() */
	initZoomPaths : function(pZoomFramePath,pZoomContentPath) {
		this.fZoomFramePath = pZoomFramePath;
		this.fZoomContentPath = pZoomContentPath;
	},
	/** PresMgr.initAltSlidePaths : Set paths of elements that constitute the alternate slide frame.
			Must be called before onLoad() */
	initAltSlidePaths : function(pAltSldRootPath, pAltSldFraPath) {
		this.fAltSldRootPath = pAltSldRootPath; // Root element containing alternate slides
		this.fAltSldFraPath = pAltSldFraPath; // Parent element containing alternate slides
	},
	/** PresMgr.initFontAutoZoom : Set font auto-zoom decrement & number of steps.
			Must be called before onLoad() */
	initFontAutoZoom : function(pSteps, pDecrement) {
		if (pSteps) this.fFontAutoZoomSteps = pSteps;
		if (pDecrement) this.fFontAutoZoomDecrment = pDecrement;
	},
	/** PresMgr.addSlidePositionStyledPath : register a path as a slide-position styled element.
			Must be called before onLoad() */
	addSlidePositionStyledPath : function(pPath) {
		if (scHPS.fDisabled) return;
		this.fSldPosStyledElts.push(pPath);
	},
	/** PresMgr.addSlideRule : Add a bindable block
	 * @param pFunc : function that will be called for each slide (must take a SldMgr as an argument).
	 * @param pFilterPath : string - optional : scPaLib path that can filter the slides.
			Must be called before onLoad() */
	addSlideRule : function(pFunc,pFilterPath){
		if (scHPS.fDisabled) return;
		this.fSldRules.push({fFilter : pFilterPath ? scPaLib.compileFilter(pFilterPath) : "", fFunc : pFunc});
	},
	/** PresMgr.onLoad : Main onLoad function called by the SCENARI framework. */
	onLoad : function() {
		let vRule;
		let j;
		let vSldMgr;
		let vSld;
		try{
			let i;
			let vPresMgr = this;
			//Find Slideshow base elements
			this.fSldFra = scPaLib.findNode(this.fSldFraPath);
			if (!this.fSldFra) throw "Slideshow root frame not found."
			this.fNav = scPaLib.findNodes(this.fNavPath);
			if (!this.fNav) throw "Slideshow navigation bar not found."
			//
			// Page master presentation stuff
			if (this.fIsMaster){
				window.addEventListener("keyup", function(pEvt){scHPS.sOnKeyUp(pEvt,vPresMgr)},false);
				window.addEventListener("keydown", function(pEvt){scHPS.sOnKeyDown(pEvt,vPresMgr)},false);
				if (scHPS.fScreenTouch){
					window.addEventListener("touchstart", scHPS.sTouchMgr.bind(vPresMgr),true);
					window.addEventListener("touchmove", scHPS.sTouchMgr.bind(vPresMgr),true);
					window.addEventListener("touchend", scHPS.sTouchMgr.bind(vPresMgr),true);
					window.addEventListener("touchcancel", scHPS.sTouchMgr.bind(vPresMgr),true);
				}
			}
			// path & filter compilation
			this.fCoFilterComp = scPaLib.compileFilter(this.fCoFilter);
			this.fIgnoreFilterComp = scPaLib.compileFilter(this.fIgnoreFilter);
			this.fCoBlocksRootFilterComp = scPaLib.compileFilter(this.fCoBlocksRootFilter);
			this.fCoBlocksRootPathComp = scPaLib.compilePath(this.fCoBlocksRootPath);
			this.fCoAltBlocksRootPathComp = scPaLib.compilePath(this.fCoAltBlocksRootPath);
			this.fCoAltBlocksMenuPathComp = scPaLib.compilePath(this.fCoAltBlocksMenuPath);
			this.fBlkCoPathComp = scPaLib.compilePath(this.fBlkCoPath);
			this.fCutableFilterComp = scPaLib.compileFilter(this.fCutableFilter);
			this.fFixedHeightFilterComp = scPaLib.compileFilter(this.fFixedHeightFilter);
			this.fForcedCutFilterComp = scPaLib.compileFilter(this.fForcedCutFilter);
			this.fSlidePath = scPaLib.compilePath("des:."+this.fSlideClass);
			//Init nav bar
			for (i = 0; i<this.fNav.length; i++){
				const vNav = this.fNav[i];
				vNav.fDefaultClass = vNav.className;
				vNav.innerHTML = ""; // Purge the nav bar
				vNav.fBtnPrv = this.xAddBtn(vNav, "btnPrv", scHPS.xGetStr(0), scHPS.xGetStr(1));
				vNav.fBtnPrv.style.visibility = "hidden";
				vNav.fBtnPrv.setAttribute("aria-hidden", "true");
				vNav.fBtnNxt = this.xAddBtn(vNav, "btnNxt", scHPS.xGetStr(2), scHPS.xGetStr(3));
			}
			//Init zoom container
			this.fZoom = (this.fZoomFramePath ? scPaLib.findNode(this.fZoomFramePath) : scDynUiMgr.addElement("div", document.body));
			if (!this.fZoom) throw "Slideshow zoom container not found."
			this.fZoom.className = this.fZoom.className + " "+this.fSsClassPrefix+"Zm";
			this.fZoom.style.visibility = "hidden";
			this.fZoom.setAttribute("aria-hidden", "true");
			this.fZoom.fCo = (this.fZoomContentPath ? scPaLib.findNode(this.fZoomContentPath) : this.fZoom);
			this.fZoom.fSld = scDynUiMgr.addElement("div", this.fZoom.fCo, this.fSsClassPrefix+"ZmSld");
			this.fZoom.fFrg = scDynUiMgr.addElement("div", this.fZoom.fCo, this.fSsClassPrefix+"ZmFrg");
			this.fZoom.fBtnCls = this.xAddBtn(this.fZoom.fCo, "btnZmCls", scHPS.xGetStr(4), scHPS.xGetStr(5));
			//Init slide-position styled elements
			for (i = 0; i<this.fSldPosStyledElts.length; i++){
				this.fSldPosStyledElts[i] = scPaLib.findNode(this.fSldPosStyledElts[i]);
				if (this.fSldPosStyledElts[i]) this.fSldPosStyledElts[i].fBaseClass = this.fSldPosStyledElts[i].className;
			}
			//Init slides
			const vLocalSlds = scPaLib.findNodes(this.fSlidePath, this.fSldFra);
			this.fFirstLocalIdx = -vLocalSlds.length;
			for (i = 0; i<vLocalSlds.length; i++){
				vSld = vLocalSlds[i];
				vSld.fSldHdr = new scHPS.SldHdr(i - vLocalSlds.length, this);
				vSldMgr = new scHPS.SldMgr(vSld, vSld.fSldHdr);
				for (j = 0; j<this.fSldRules.length; j++){
					try {
						vRule = this.fSldRules[j];
						if (vRule.fFilter === "" || scPaLib.checkNode(vRule.fFilter, vSld)) vRule.fFunc(vSldMgr);
					} catch(e){console.warn("WARNING PresMgr.onLoad - slide rule num. " + j + ": "+e);}
				}
				vSld.fSldHdr.initSld();
				scHPS.xEndOpacityEffect(vSld, 0, true);
			}
			//Init alt slides
			if (this.fAltSldRootPath && this.fAltSldFraPath){
				this.fAltSlides = scPaLib.findNode(this.fAltSldRootPath)
				const vAltSldFra = scPaLib.findNode(this.fAltSldRootPath);
				if (!this.fAltSlides || !vAltSldFra) throw "Alternative slide container not found.";
				this.fAltSlides.style.visibility = "hidden";
				this.fAltSlides.setAttribute("aria-hidden", "true");
				this.fAltSlides.fFra = vAltSldFra;
				this.fAltSlides.fSlides = {};
				this.fAltSlides.fBtnCls = this.xAddBtn(this.fAltSlides, "btnAltSldCls", scHPS.xGetStr(4), scHPS.xGetStr(5));
				const vAltSlds = scPaLib.findNodes(this.fSlidePath, vAltSldFra);
				for (i = 0; i<vAltSlds.length; i++){
					vSld = vAltSlds[i];
					this.fAltSlides.fSlides[vSld.id] = vSld;
					vSld.fSldHdr = new scHPS.SldAltHdr(this);
					vSldMgr = new scHPS.SldMgr(vSld, vSld.fSldHdr);
					for (j = 0; j<this.fSldRules.length; j++){
						try {
							vRule = this.fSldRules[j];
							if (vRule.fFilter === "" || scPaLib.checkNode(vRule.fFilter, vSld)) vRule.fFunc(vSldMgr);
						} catch(e){console.warn("WARNING PresMgr.onLoad - alternative slide rule num. " + j + ": "+e);}
					}
					vSld.fSldHdr.initSld();
					scHPS.xEndOpacityEffect(vSld, 0, true);
				}
			}

			//Init toc
			if (this.fTocLnksPath){
				const vTocLnks = scPaLib.findNodes(this.fTocLnksPath);
				if (vTocLnks.length>0){
					const vBtnHome = vTocLnks.shift();
					vPresMgr = this;
					const vFirstIdx = this.fFirstLocalIdx;
					vBtnHome.onclick = function(){vPresMgr.loadSlide(vFirstIdx, true);return false;};
					for (i = 0; i < vTocLnks.length; i++){
						const vLnk = vTocLnks[i];
						vLnk.fPresMgr = this;
						if(vLnk.getAttribute("data-type") === "blk"){
							vLnk.fTarget = scPaLib.findNode("anc:"+this.fCoFilter, sc$(vLnk.hash.substring(1)));
							vLnk.onclick = scHPS.PresMgr.sOnClickBlkLnk;
						} else { // Link to a slide
							const vLocalSlide = sc$(vLnk.hash.substring(1));
							vLnk.fSldIdx = vLocalSlide.fSldHdr.fSldIdx;
							vLnk.onclick = scHPS.PresMgr.sOnClickTocLnk;
						}
					}
				}
			}
			//Affichage du premier slide (rendu instantanné)
			let vFirstSlide = vLocalSlds[0];
			if (vFirstSlide) this.fSwitchSldTask.initTask(vFirstSlide, "first");
			else throw "no slides found."
			this.xNotifyListeners("onAction", "presMgrReady");
		}catch(e){console.error("ERROR PresMgr.onLoad : "+e);}
	},
	loadSortKey : "A",
	/** PresMgr.register : register a listener. */
	register : function(pType, pFunc, pCtx) {
		if (scHPS.fDisabled) return;
		if (pCtx) {
			this.fListeners[pType].push(pFunc.bind(pCtx));
		} else this.fListeners[pType].push(pFunc);
	},
	/** PresMgr.toggleKeyboardNavigation : Toggle keyboard navigation */
	toggleKeyboardNavigation : function(pSet) {
		if (typeof pSet == "undefined") pSet = ! this.fKeyActive;
		this.fKeyActive = pSet;
	},
	/** PresMgr.setKeyMap : change how the keys are interpreted.
			@param pKeyMap : object defining the action->mapping (see scHPS.fKeyMap at top of file)  */
	setKeyMap : function(pKeyMap) {
		let vAction;
		for (vAction in scHPS.fKeyMap){
			if (typeof pKeyMap[vAction] == "undefined") pKeyMap[vAction] = scHPS.fKeyMap[vAction];
		}
		this.fKeyMap = scHPS.xProcessKeyMap(pKeyMap);
	},
	/** PresMgr.setDefaultFontSize */
	setDefaultFontSize : function(pDefaultFontSize){
		this.fDefaultFontSize = pDefaultFontSize;
	},
	/** PresMgr.loadSlide : Load a slide by index id.
	 * @param pIdx
	 * @param pFromStart : boolean - Affiche le slide du début (true) ou de la fin (false).
	 * @return false si échec (pas de slide d'idx pIdx, ...) */
	loadSlide : function(pIdx, pFromStart) {
		if (scHPS.fDisabled) return;
		this.xNotifyListeners("onAction", "loadSlide");
		this.xResetFocus();
		return this.xGotoSlide(pIdx, pFromStart);
	},
	/** PresMgr.getCurrSlide : Returns the current slide.
	 * @return current slide */
	getCurrSlide : function(){
		if (scHPS.fDisabled) return;
		if (this.fAltSlides && this.fAltSlides.fAct) return this.fAltSlides.fCurrSld
		return this.fSwitchSldTask.fNewSld || this.fCurrSld;
	},
	/** PresMgr.getCurrBlock : Returns the current block in the current slide.
	 * @return current block */
	getCurrBlock : function(){
		if (scHPS.fDisabled) return;
		const vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			return vSld.fSldHdr.getCurrBlk();
		} else return null;
	},
	/** PresMgr.getNextBlock : Returns the next block.
	 * @return next block */
	getNextBlock : function(){
		if (scHPS.fDisabled) return;
		const vSld = this.getCurrSlide();
		if (!vSld) return null;
		if (vSld && vSld.fSldHdr.hasNextBlock()) {
			return vSld.fSldHdr.getNextBlock();
		} else {
			const vSlds = scPaLib.findNodes(this.fSlidePath, this.fSldFra);
			for (let i=0; i<vSlds.length; i++){
				const vNxtSld = vSlds[i];
				if(vNxtSld.fSldHdr.fSldIdx === vSld.fSldHdr.fSldIdx+1) {
					vNxtSld.fSldHdr.redrawSld();
					return vNxtSld.fSldHdr.getFirstBlock();
				}
			}
			return null;
		}
	},
	/** PresMgr.redrawSlideZone : Redessine de la zone des slides (suite à resize notamment). */
	redrawSlideZone : function(){
		//Si besoin fixer la zone porteuse des slides this.fSldFra en JS...
		if(this.fCurrSld) this.fCurrSld.fSldHdr.redrawSld();
		if(this.fZoom.fSldHdr) this.fZoom.fSldHdr.redrawSld();
		if(this.fAltSlides.fCurrSld) this.fAltSlides.fCurrSld.fSldHdr.redrawSld();

		let vFutureSld = this.fSwitchSldTask.fNewSld;
		let vSld = this.fSldFra.firstChild;
		while(vSld) {
			if(vSld === this.fCurrSld || vSld === vFutureSld ) {
				vSld.fSldHdr.redrawSld();
			} else {
				vSld.fSldHdr.invalidateSize();
			}
			vSld = vSld.nextSibling;
		}
		for (let vSldId in this.fAltSlides.fSlides){
			vSld = this.fAltSlides.fSlides[vSldId];
			if(vSld === this.fAltSlides.fCurrSld) {
				vSld.fSldHdr.redrawSld();
			} else {
				vSld.fSldHdr.invalidateSize();
			}
		}
	},
	/** PresMgr.hasNext :
	 * @return true if the presentation has a next step / slide */
	hasNext : function() {
		if (scHPS.fDisabled) return;
		const vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			return (vSld.fSldHdr.hasNext() ? true : !vSld.fSldHdr.isLastSld());
		} else return false;
	},
	/** PresMgr.hasPrevious :
	 * @return true if the presentation has a previous step / slide */
	hasPrevious : function() {
		if (scHPS.fDisabled) return;
		const vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			return (vSld.fSldHdr.hasPrevious() ? true : !vSld.fSldHdr.isFirstSld());
		} else return false;
	},
	/** PresMgr.showZoom : Show the passed ressource in the zoom.
	 * @param pRes : element - resource to zoom.
	 * @param pOpts : object - optional : zoom options. */
	showZoom : function(pRes, pOpts) {
		if (scHPS.fDisabled) return;
		return this.xShowZoom(pRes, pOpts);
	},
	/** PresMgr.next : Move forward 1 step / slide.
	 * @param pSkip : boolean if true move to beginning of next slide.
	 * @return false si l'action a échouée (chargement en cours du slide). */
	next : function(pSkip) {
		if (scHPS.fDisabled) return;
		if(this.fZoom.fAct && !pSkip){
			if(!this.fZoom.fSldHdr || this.fZoom.fSldHdr && !this.fZoom.fSldHdr.goToNxt()) this.xHideZoom();
		} else if(this.fAltSlides && this.fAltSlides.fAct && !pSkip){
			this.xNotifyListeners("onAction", "next");
			if(!this.fAltSlides.fSldHdr || this.fAltSlides.fSldHdr && !this.fAltSlides.fSldHdr.goToNxt()) this.xHideAltSlide();
		} else {
			this.xHideZoom();
			const vFromSld = this.fSwitchSldTask.fNewSld || this.fCurrSld;
			if( ! vFromSld) return false;
			this.xNotifyListeners("onAction", "next");
			if (pSkip || ! vFromSld.fSldHdr.goToNxt()) {
				return this.xGotoSlide(vFromSld.fSldHdr.fSldIdx+1, true);
			}
		}
		return true;
	},
	/** PresMgr.previous : Move back 1 step / slide.
	 * @param pSkip : boolean if true move to beginning of previous slide.
	 * @return false si l'action a échouée (chargement en cours du slide). */
	previous : function(pSkip) {
		if (scHPS.fDisabled) return;
		if(this.fZoom.fAct && !pSkip){
			if(!this.fZoom.fSldHdr || this.fZoom.fSldHdr && !this.fZoom.fSldHdr.goToPrv()) this.xHideZoom();
		} else if(this.fAltSlides && this.fAltSlides.fAct && !pSkip){
			this.xNotifyListeners("onAction", "previous");
			if(!this.fAltSlides.fSldHdr || this.fAltSlides.fSldHdr && !this.fAltSlides.fSldHdr.goToPrv()) this.xHideAltSlide();
		} else {
			this.xHideZoom();
			const vFromSld = this.fSwitchSldTask.fNewSld || this.fCurrSld;
			if( ! vFromSld) return false;
			this.xNotifyListeners("onAction", "previous");
			if (pSkip || ! vFromSld.fSldHdr.goToPrv()) {
				return this.xGotoSlide(vFromSld.fSldHdr.fSldIdx-1, (!!pSkip));
			}
		}
		return true;
	},
	/** PresMgr.first : Load first slide. */
	first : function() {
		this.loadSlide(this.fFirstLocalIdx, true);
	},
	/* --- private ------------------------------------------------------------ */
	/** PresMgr.xUpdateGui */
	xUpdateGui : function() {
		const vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			for (let i=0; i<this.fNav.length; i++){
				const vNav = this.fNav[i];
				if(vSld.fSldHdr.hasNext()){
					vNav.fBtnNxt.style.visibility = "";
					vNav.fBtnNxt.removeAttribute("aria-hidden");
				} else if (!vSld.fSldHdr.isLastSld()){
					vNav.fBtnNxt.style.visibility = "";
					vNav.fBtnNxt.removeAttribute("aria-hidden");
				} else {
					vNav.fBtnNxt.style.visibility = "hidden";
					vNav.fBtnNxt.setAttribute("aria-hidden", "true");
				}
				if(vSld.fSldHdr.hasPrevious()){
					vNav.fBtnPrv.style.visibility = "";
					vNav.fBtnPrv.removeAttribute("aria-hidden");
				} else if (!vSld.fSldHdr.isFirstSld()){
					vNav.fBtnPrv.style.visibility = "";
					vNav.fBtnPrv.removeAttribute("aria-hidden");
				} else {
					vNav.fBtnPrv.style.visibility = "hidden";
					vNav.fBtnPrv.setAttribute("aria-hidden", "true");
				}
			}
		}
		this.xUpdateSldPosStyledElts();
	},
	/** PresMgr.xUpdateSldPosStyledElts */
	xUpdateSldPosStyledElts : function() {
		// Add slide-postion classes on registered elements if needed.
		let vSldClass = "";
		const vSld = this.fSwitchSldTask.fNewSld || this.fCurrSld;
		if (vSld && vSld.fSldHdr) {
			vSldClass += (vSld.fSldHdr.isFirstSld() ? " "+this.fSsClassPrefix+"FirstSlide" : "");
			vSldClass += (!vSld.fSldHdr.hasPreviousBlock() ? " "+this.fSsClassPrefix+"FirstBlock" : "");
			vSldClass += (!vSld.fSldHdr.hasPrevious() ? " "+this.fSsClassPrefix+"FirstStep" : "");
			vSldClass += (vSld.fSldHdr.isLastSld() ? " "+this.fSsClassPrefix+"LastSlide" : "");
			vSldClass += (!vSld.fSldHdr.hasNextBlock() ? " "+this.fSsClassPrefix+"LastBlock" : "");
			vSldClass += (!vSld.fSldHdr.hasNext() ? " "+this.fSsClassPrefix+"LastStep" : "");
		}
		if (this.fAltSlides && this.fAltSlides.fAct){
			vSldClass += " "+this.fSsClassPrefix+"AltSlide";
			const vSldHdr = this.fAltSlides.fSldHdr;
			if (vSldHdr) {
				vSldClass += (!vSldHdr.hasPrevious() ? " "+this.fSsClassPrefix+"AltFirstStep" : "");
				vSldClass += (!vSldHdr.hasNext() ? " "+this.fSsClassPrefix+"AltLastStep" : "");
			}
		}
		for (let i=0; i<this.fSldPosStyledElts.length; i++){
			const vClass = this.fSldPosStyledElts[i].fBaseClass + vSldClass;
			if (this.fSldPosStyledElts[i].className !== vClass) this.fSldPosStyledElts[i].className = vClass;
		}
	},
	/** PresMgr.xGotoSlide : Navigation vers un slide.
	 * @param pIdx : int - Slide index to load.
	 * @param pFromStart : boolean - Affiche le slide du début (true) ou de la fin (false).
	 * @return false si echec (pas de slide d'idx pIdx, ...) */
	xGotoSlide : function(pIdx, pFromStart) {
		let vBlock;
		let vCurrSldHdr;
		try{
			//Borne pIdx selon les limites du slide show
			if(pIdx < this.fFirstLocalIdx) return false;
			if(pIdx >= 0) return false;

			const vFutureSld = this.fSwitchSldTask.fNewSld;
			const vFutureIdx = vFutureSld ? vFutureSld.fSldHdr.fSldIdx : -9999;
			const vCurrIdx = this.fCurrSld ? this.fCurrSld.fSldHdr.fSldIdx : -9999;
			if(vCurrIdx === pIdx) {
				//On redemande le slide en cours.
				//On kill un éventuel début de transition vers un autre slide.
				if(vFutureSld) this.fSwitchSldTask.rollbackTask();
				vCurrSldHdr = this.fCurrSld.fSldHdr;
				vBlock = pFromStart ? vCurrSldHdr.getFirstBlock() : vCurrSldHdr.getLastBlock();
				this.fSwitchBlkTask.initTask(vCurrSldHdr.getCurrBlk(), vBlock, pFromStart? "F" : "L");
				this.xNotifyListeners("onSldRestart", this.fCurrSld);
			} else if(vFutureIdx === pIdx) {
				//On redemande le slide qui va venir
				this.fSwitchSldTask.precipitateEndTask();
				vCurrSldHdr = this.fCurrSld.fSldHdr;
				vBlock = pFromStart ? vCurrSldHdr.getFirstBlock() : vCurrSldHdr.getLastBlock();
				this.fSwitchBlkTask.initTask(vCurrSldHdr.getCurrBlk(), vBlock, pFromStart? "F" : "L");
			} else {
				//Recherche le slide dans le cache
				const vSlds = scPaLib.findNodes(this.fSlidePath, this.fSldFra);
				for (let i=0; i<vSlds.length; i++){
					const vSld = vSlds[i];
					if(vSld.fSldHdr.fSldIdx === pIdx) {
						//Trouvé
						vSld.fSldHdr.redrawSld();
						this.fSwitchSldTask.initTask(vSld, pFromStart? "first" : "last");
						return true;
					}
				}
			}
			return true;
		}catch(e){console.error("ERROR PresMgr.xGotoSlide : "+e);}
	},
	/** PresMgr.xSetCurrSlide : Affecte le nouveau slide "stabilisé" et devient la nouvelle référence.
	 * Gère le cache des slides en fonction de cette nouvelle position.
	 * @param pNewCurrSlide : Element new slide to set as current. */
	xSetCurrSlide : function(pNewCurrSlide) {
		try{
			if (this.fCurrSld) this.fCurrSld.classList.remove(this.fSsClassPrefix+"CurrentSlide");
			this.fCurrSld = pNewCurrSlide;
			this.fCurrSld.classList.add(this.fSsClassPrefix+"CurrentSlide");
			this.xResetFocus();
			this.xNotifyListeners("onSldShow", this.fCurrSld);
		}catch(e){console.error("ERROR PresMgr.xSetCurrSlide : "+e);}
	},
	/** PresMgr.xInitBlocks : Init tous les blocks fils d'un blockRoot (du slide ou d'un container) */
	xInitBlocks : function(pParentHdr, pBlockRoot){
		const vResult = [];
		if(pBlockRoot) {
			let vRootHdr = pParentHdr;
			while(typeof vRootHdr.fParentHdr != "undefined") vRootHdr = vRootHdr.fParentHdr;
			let vNode = pBlockRoot.firstChild;
			while(vNode) {
				if(vNode.nodeType===1) {
					if(!scPaLib.checkNode(this.fIgnoreFilterComp, vNode)) {
						if(scPaLib.checkNode(this.fCoFilterComp, vNode)) {
							vNode.fBlkHdr = new scHPS.BlkCoHdr(pParentHdr, vNode, vResult.length);
						} else {
							vNode.fBlkHdr = new scHPS.BlkHdr(pParentHdr, vNode, vResult.length);
							if (!scPaLib.findNode("anc:"+this.fCoAltBlocksRootFilter, vNode)) vNode.fCount = vRootHdr.fBlkCount++
							else vNode.fCount = "";
						}
						vNode.fIdx = vResult.length;
						vResult[vResult.length] = vNode;
						vNode.style.visibility = "hidden";
						vNode.setAttribute("aria-hidden", "true");
						vNode.style.opacity = "0";
					}
				}
				vNode = vNode.nextSibling;
			}
		}
		return vResult;
	},
	/** PresMgr.xKeyMgr */
	xKeyMgr : function(pCharCode){
		if (!this.fKeyActive) return false;
		this.xNotifyListeners("onKeyPress", pCharCode);
		let vAction;
		try{
			vAction = this.fKeyMap[String(pCharCode)];
		} catch(e){}
		if (!vAction) return false;
		switch(vAction){
			case "nextStep":
				this.next(); return false;
			case "previousStep":
				this.previous(); return false;
			case "nextSlide":
				this.next(true); return false;
			case "previousSlide":
				this.previous(true); return false;
			case "home":
				this.loadSlide(this.fFirstLocalIdx, true);return false;
			case "closeZoom":
				if (!this.xHideZoom()) this.xHideAltSlide(); return false;

		}
	},
	/** PresMgr.xShowZoom : display the zoom window
	 * @param pRes : element - resource to zoom
	 * @param pOpt : object - zoom options (type, etc.) */
	xShowZoom : function(pRes, pOpt){
		let vDst = null;
		const vZm = this.fZoom;
		const vPresMgr = this;
		pOpt = pOpt || {};
		vZm.fOpt = pOpt;
		vZm.fFraHdr = null;
		vZm.fSldHdr = null;
		vZm.fSld.innerHTML = "";
		vZm.fFrg.innerHTML = "";
		if (!vZm.fAct){
			vZm.fAct = true;
			switch(pOpt.type){
				case "fra":
					new scHPS.FadeEltTask(vZm.fFrg,0);
					new scHPS.FadeEltTask(vZm.fSld,1);
					vZm.fFraHdr = new scHPS.FraZmHdr(vZm.fSld, pRes.href,vPresMgr);
					vZm.fFraHdr.init();
					new scHPS.FadeEltTask(vZm,1);
					break;

				case "dyn":
					new scHPS.FadeEltTask(vZm.fFrg,1);
					new scHPS.FadeEltTask(vZm.fSld,0);
					vDst = pOpt.buildZoom(pRes, vZm.fFrg);
					new scHPS.FadeEltTask(vZm,1);
					break;

				default:
					new scHPS.FadeEltTask(vZm.fFrg,1);
					new scHPS.FadeEltTask(vZm.fSld,0);
					vDst = scHPS.xImportDeepNode(pRes, vZm.fFrg.ownerDocument, vZm.fFrg);
					new scHPS.FadeEltTask(vZm,1);
			}
			for (let i=0; i<this.fNav.length; i++) {
				const vNav = this.fNav[i];
				vNav.className = vNav.fDefaultClass + " "+this.fSsClassPrefix+"NavZoom";
			}
		} else {
			switch(pOpt.type){
				case "fra":
					vZm.fFraHdr = new scHPS.FraZmHdr(vZm.fSld, pRes.href,vPresMgr);
					vZm.fFraHdr.init();
					break;

				case "dyn":
					vDst = pOpt.buildZoom(pRes, vZm.fFrg);
					new scHPS.FadeEltTask(vZm.fSld,0);
					new scHPS.FadeEltTask(vZm.fFrg,1);
					break;

				default:
					vDst = scHPS.xImportDeepNode(pRes, vZm.fFrg.ownerDocument, vZm.fFrg);
					new scHPS.FadeEltTask(vZm.fSld,0);
					new scHPS.FadeEltTask(vZm.fFrg,1);
			}
		}
		vZm.fBtnCls.focus();
		this.xNotifyListeners("onAction", "showZoom");
		return vDst;
	},
	/** PresMgr.xHideZoom : hide the zoom window */
	xHideZoom : function(){
		if (this.fZoom.fAct){
			this.fZoom.fAct = false;
			if (this.fZoom.fOpt.focusOnClose) this.fZoom.fOpt.focusOnClose.focus();
			new scHPS.FadeEltTask(this.fZoom,0);
			for (let i=0; i<this.fNav.length; i++) {
				const vNav = this.fNav[i];
				vNav.className = vNav.fDefaultClass;
			}
			this.xNotifyListeners("onAction", "hideZoom");
			return true;
		} else return false;
	},
	/** PresMgr.xGetZoomContainer : return the zoom container */
	xGetZoomContainer : function(){
		return this.fZoom.fFrg;
	},
	/** PresMgr.xGetZoomSlide : return the zoom iframe container */
	xGetZoomSlide : function(){
		return this.fZoom.fFra;
	},
	/** PresMgr.xShowAltSlide : display the alternative slide zoom window
	 * @param pRes : element - resource to zoom
	 * @param pOpt : object - zoom options (?, etc.) */
	xShowAltSlide : function(pRes, pOpt){
		const vZm = this.fAltSlides;
		if(!vZm) return false;
		vZm.fSldHdr = null;
		let vBlockId;
		let vSldId = pRes.hash.substring(1);
		if (vSldId.indexOf(":")>0){
			vBlockId = vSldId.split(":")[1];
			vSldId = vSldId.split(":")[0];
		}
		const vSld = vZm.fSlides[vSldId];
		if (!vSld) return false;
		vZm.fSldHdr = vSld.fSldHdr;
		if (vZm.fCurrSld) new scHPS.FadeEltTask(vZm.fCurrSld,0);
		new scHPS.FadeEltTask(vSld,1);
		this.fSwitchBlkTask.initTask(vZm.fSldHdr.fCurrBlk, vBlockId ? sc$(vBlockId) : vZm.fSldHdr.getFirstBlock(), "F");
		if (!vZm.fAct){
			vZm.fAct = true;
			new scHPS.FadeEltTask(vZm,1);
			for (let i=0; i<this.fNav.length; i++) {
				const vNav = this.fNav[i];
				vNav.className = vNav.fDefaultClass + " "+this.fSsClassPrefix+"NavZoom";
			}
		}
		vZm.fCurrSld = vSld;
		this.xUpdateGui();
		this.xNotifyListeners("onAction", "showAltSlide");
	},
	/** PresMgr.xHideAltSlide : hide the alternative slide zoom window */
	xHideAltSlide : function(){
		if (this.fAltSlides && this.fAltSlides.fAct){
			const vZm = this.fAltSlides;
			vZm.fAct = false;
			vZm.fSldHdr = null;
			if (vZm.fCurrSld) new scHPS.FadeEltTask(vZm.fCurrSld,0);
			vZm.fCurrSld = null;
			new scHPS.FadeEltTask(this.fAltSlides,0);
			// TODO: Desactiver la slide demandée
			for (let i=0; i<this.fNav.length; i++) {
				const vNav = this.fNav[i];
				vNav.className = vNav.fDefaultClass;
			}
			this.xUpdateGui();
			this.xNotifyListeners("onAction", "hideAltSlide");
			return true;
		} return false;
	},
	/** PresMgr.xResetFocus - sets the focus to the current slide. */
	xResetFocus : function() {
		if (this.fCurrSld && this.fCurrSld.fSldHdr && this.fCurrSld.fSldHdr.fFraNode){
			const vFra = this.fCurrSld.fSldHdr.fFraNode;
			if (vFra.focus) vFra.focus();
			const vPge = this.fCurrSld.fSldHdr.fSldMgr.getBlksRoot();
			if (vPge && vPge.focus) vPge.focus();
		}
	},
	/** PresMgr.xNotifyListeners - calls all the listeners of a given type. */
	xNotifyListeners : function(pType,pRes) {
		const vListener = this.fListeners[pType];
		for (let i=0; i<vListener.length; i++) {
			try {
				vListener[i](pRes);
			} catch(e) {console.info("ERROR PresMgr.xNotifyListeners : "+e);}
		}
	},
	/* --- Tasks -------------------------------------------------------------- */
	/** PresMgr.fSwitchSldTask : Task that switches from the current slide to a new one. */
	fSwitchSldTask : {
		fNewSld: null,
		fStatus: null,
		fPresMgr: null,
		/** PresMgr.fSwitchSldTask.initTask : Init la task pour accéder à un nouveau slide.
		 * @param pNewSld block à afficher.
		 * @param pStatus
		 * 			"first" : affichage du 1er step du 1er block,
		 * 			"last" : affichage du dernier step du dernier block. */
		initTask : function(pNewSld, pStatus){
			try{
				this.fPresMgr = pNewSld.fSldHdr.getPresMgr();
				//On annule tout autre task en cours
				this.fPresMgr.fSwitchStpTask.precipitateEndTask();
				this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
				if (this.fNewSld) {
					//On annule les effets en cours pour revenir à la situation initiale.
					scHPS.xEndOpacityEffect(this.fNewSld, 0, true);
				}
				this.fNewSld = pNewSld;
				this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
				this.fStatus = pStatus;
				this.precipitateEndTask();
			}catch(e){console.error("ERROR PresMgr.fSwitchSldTask.initTask : "+e);}
		},
		/** PresMgr.fSwitchSldTask.precipitateEndTask : Précipite la fin de la task en cours. */
		precipitateEndTask : function(){
			try{
				if( ! this.fNewSld) return;
				if(this.fPresMgr.fCurrSld) {
					scHPS.xEndOpacityEffect(this.fPresMgr.fCurrSld, 0);
					if (this.fPresMgr.fCurrSld.fSldHdr.fCurrBlk) {
						try{
							let vBlock = this.fPresMgr.fCurrSld.fSldHdr.fCurrBlk;
							while (!vBlock.fBlkHdr.fBlkContent && vBlock.fBlkHdr.fCurrSubBlk){
								vBlock = vBlock.fBlkHdr.fCurrSubBlk;
							}
							vBlock.fBlkHdr.fBlkContent.classList.remove("animate");
						} catch (e) {console.error("SwitchSldTask : Block content element missing on current Slide.")}
						this.fPresMgr.fCurrSld.fSldHdr.fCurrBlk.classList.remove(this.fPresMgr.fSsClassPrefix+"CurrentBlock");
					}
				}
				if(this.fStatus !== "") {
					//Le block et step n'ont pas encoré été initialisés, animation non démarrée
					const vNewSldHdr = this.fNewSld.fSldHdr;
					switch(this.fStatus) {
						case "first" :
							this.fPresMgr.fSwitchBlkTask.initTask(vNewSldHdr.getCurrBlk(), vNewSldHdr.getFirstBlock(), "F");
							break;
						case "last" :
							this.fPresMgr.fSwitchBlkTask.initTask(vNewSldHdr.getCurrBlk(), vNewSldHdr.getLastBlock(), "L");
							break;
					}
				}
				scHPS.xEndOpacityEffect(this.fNewSld, 1);
				this.fPresMgr.xUpdateGui();
				this.fPresMgr.xSetCurrSlide(this.fNewSld);
				this.fNewSld = null;
				this.fStatus = null;
			}catch(e){console.error("ERROR PresMgr.fSwitchSldTask.precipitateEndTask : "+e);}
		},
		/** PresMgr.fSwitchSldTask.rollbackTask : Annule l'animation et retourne sur le slide en cours. */
		rollbackTask : function(){
			try{
				if( ! this.fNewSld) return;
				if(this.fStatus === "") {
					//On avait commencé à basculer...
					scHPS.xEndOpacityEffect(this.fNewSld, 0, true);
					if(this.fPresMgr.fCurrSld) scHPS.xEndOpacityEffect(this.fPresMgr.fCurrSld, 1);
				}
				this.fNewSld = null;
				this.fStatus = null;
			}catch(e){console.error("ERROR PresMgr.fSwitchSldTask.rollbackTask : "+e);}
		}
	},
	/** PresMgr.fSwitchBlkTask : Task that switches from the current block to a new one. */
	fSwitchBlkTask : {
		fOldBlock: null,
		fNewBlock: null,
		/** PresMgr.fSwitchBlkTask.initTask : init la task pour accéder à un nouveau block.
		 * @param pOldBlock
		 * @param pNewBlock
		 * @param pTarget Block/Step cible à afficher
		 * 			"F" : First
		 * 			"L" : Last
		 * 			"S" : Same : redraw suite à resize*/
		initTask : function(pOldBlock, pNewBlock, pTarget){
			if(!pNewBlock) return;
			try{
				this.fPresMgr = pNewBlock.fBlkHdr.getPresMgr();
				//On précipite le chgt de steps.
				this.fPresMgr.fSwitchStpTask.precipitateEndTask();
				if (this.fNewBlock) {
					//On précipite notre propre task qui est en cours.
					this.precipitateEndTask();
				}
				//Positionnement du bloc (et de ses fils).
				pNewBlock.fBlkHdr.fixSizeAndTarget(pTarget);
				if(pOldBlock === pNewBlock) {
					//Pas d'animation si ce block est déjà le current.
					this.fOldBlock = null;
					this.fNewBlock = null;
					return;
				}
				this.fOldBlock = pOldBlock;
				this.fNewBlock = pNewBlock;
				this.precipitateEndTask();
			}catch(e){console.error("ERROR PresMgr.fSwitchBlkTask.initTask : "+e);}
		},
		/** PresMgr.fSwitchBlkTask.precipitateEndTask : Précipite la fin de la task en cours. */
		precipitateEndTask : function(){
			try{
				if(!this.fNewBlock) return;
				if(this.fOldBlock) {
					scHPS.xEndOpacityEffect(this.fOldBlock, 0);
					try{
						let vBlock = this.fOldBlock;
						while (!vBlock.fBlkHdr.fBlkContent && vBlock.fBlkHdr.fCurrSubBlk){
							vBlock = vBlock.fBlkHdr.fCurrSubBlk;
						}
						vBlock.fBlkHdr.fBlkContent.classList.remove("animate");
					} catch (e) {console.error("SwitchSldTask : Old block content element missing.")}
					this.fOldBlock.classList.remove(this.fPresMgr.fSsClassPrefix+"CurrentBlock");
				}
				scHPS.xEndOpacityEffect(this.fNewBlock, 1);
				this.fNewBlock.classList.add(this.fPresMgr.fSsClassPrefix+"CurrentBlock");
				this.fNewBlock.fBlkHdr.fParentHdr.setCurrBlock(this.fNewBlock);
				this.fPresMgr.xNotifyListeners("onBlkShow", this.fNewBlock);
				this.fPresMgr.xUpdateGui();
				this.fNewBlock = null;
				this.fOldBlock = null;
			}catch(e){console.error("ERROR PresMgr.fSwitchBlkTask.precipitateEndTask : "+e);}
		}
	},
	/** PresMgr.fSwitchStpTask : TiLib task that switches from the current step to a new one. */
	fSwitchStpTask : {
		/** Paramétrage de l'animation. */
		fBlkHdr: null,
		fTargetStepIdx : -1,
		/** Objectif à atteindre en termes de déplacement du content. */
		fTargetTop : 0,
		/** Mask qui va détenir le focus. */
		fNewMask : null,
		/** Mask précédent qui détenait le focus. */
		fOldMask : null,
		/** PresMgr.fSwitchStpTask.initTask : init la task pour accéder à un nouveau step.
		 * @param pBlock
		 * @param pTargetStep Step cible à passer en focus
		 * 			"F" : First (pInstantResult est alors forcé à true)
		 * 			"L" : Last (pInstantResult est alors forcé à true)
		 * 			"N" : Next Retourne false si pas de next, true si next trouvé.
		 * 			"P" : Previous
		 * 			"S" : Same : redraw suite à resize (pInstantResult est ainsi forcé à true)
		 * 					Note : le début est le même, la fin du step peut varier.
		 * @param pInstantResult si true précipite le résultat instantanément, sans animation. */
		initTask : function(pBlock, pTargetStep, pInstantResult){
			try{
				this.fPresMgr = pBlock.fBlkHdr.getPresMgr();
				if(this.fBlkHdr) {
					this.precipitateEndTask(pInstantResult);
					//Enchainement rapide, plus d'animation.
					pInstantResult = true;
				}
				const vBlkHdr = pBlock.fBlkHdr;
				if( ! vBlkHdr.fSteps) return false;
				switch(pTargetStep) {
					case "F":
						this.fTargetStepIdx = 0;
						pInstantResult = true;
						break;
					case "L":
						this.fTargetStepIdx = vBlkHdr.fSteps.length-1;
						pInstantResult = true;
						break;
					case "N":
						if(vBlkHdr.fCurrStep < vBlkHdr.fSteps.length -1) this.fTargetStepIdx = vBlkHdr.fCurrStep+1;
						else return false;
						break;
					case "P":
						if(vBlkHdr.fCurrStep >0) this.fTargetStepIdx = vBlkHdr.fCurrStep-1;
						else return false;
						break;
					case "S":
						this.fTargetStepIdx = vBlkHdr.fCurrStep;
						pInstantResult = true;
						break;
				}
				for (let i=0; i<vBlkHdr.fMasks.length; i++){
					const vMask = vBlkHdr.fMasks[i];
					vMask.fOpacity = (i<this.fTargetStepIdx ? vMask.fOpacityPrv : vMask.fOpacityNxt);
					if (pTargetStep==="F" || pTargetStep==="L"){
						scHPS.xSetOpacity(vMask, vMask.fOpacity);
					}
				}
				this.fBlkHdr = vBlkHdr;
				//Reaffichage du mask du step en cours.
				this.fOldMask = null;
				if(vBlkHdr.fCurrStep>=0) {
					this.fOldMask = vBlkHdr.fMasks[vBlkHdr.fCurrStep];
					this.fOldMask.style.display="";
				}
				//Calcul de la hauteur cible
				const vAvailH = vBlkHdr.fBlkContent.parentNode.offsetHeight;
				this.fNewMask  = vBlkHdr.fMasks[this.fTargetStepIdx];
				this.fTargetTop = (vAvailH-this.fNewMask.offsetHeight) / 2 - this.fNewMask.offsetTop;
				//Lancement de la tache
				this.precipitateEndTask(pInstantResult);
				return true;
			}catch(e){console.error("ERROR PresMgr.fSwitchStpTask.initTask : "+e);}
		},
		/** PresMgr.fSwitchStpTask.precipitateEndTask : Permet de précipiter la fin de la task en cours. */
		precipitateEndTask : function(pInstant){
			try{
				if(! this.fBlkHdr) return;
				if (this.fBlkHdr.fCurrStep >= 0 && !pInstant) this.fBlkHdr.fBlkContent.classList.add("animate");
				//On place le content
				this.fBlkHdr.fBlkContent.style.top = this.fTargetTop+"px";
				if(this.fOldMask) {
					scHPS.xSetOpacity(this.fOldMask, this.fOldMask.fOpacity);
				}
				scHPS.xSetOpacity(this.fNewMask, 0);
				//On suppr le mask du step en cours (pour l'interactivité)
				if (!pInstant) {
					const vNewMask = this.fNewMask;
					setTimeout(function(){
						vNewMask.style.display = "none";
					}, 500)

				} else this.fNewMask.style.display = "none";
				//On affecte le nouvel état.
				this.fBlkHdr.xSetCurrStep(this.fTargetStepIdx);
				this.fPresMgr.xNotifyListeners("onStpShow", this.fNewMask);
				this.fPresMgr.xUpdateGui();
				this.fBlkHdr = null;
				this.fTargetStepIdx = -1;
				this.fOldMask = null;
				this.fNewMask = null;
			}catch(e){console.error("ERROR PresMgr.fSwitchStpTask.precipitateEndTask : "+e);}
		}
	},
	/* --- Utilities ---------------------------------------------------------- */
	/** PresMgr.xAddBtn */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		return scHPS.xAddBtn(pParent, this, scHPS.PresMgr.sBtnMgr, pClassName, pCapt, pTitle, pNxtSib);
	}
}
/* --- Static --------------------------------------------------------------- */
/** PresMgr.sOnClickTocLnk : Slide TOC item onclick event - this = link */
scHPS.PresMgr.sOnClickTocLnk = function(){
	this.fPresMgr.loadSlide(this.fSldIdx, true);
	return false;
}
/** PresMgr.sOnClickBlkLnk : Block TOC item onclick event - this = link */
scHPS.PresMgr.sOnClickBlkLnk = function(){
	if (this.fPresMgr.fCurrSld) this.fPresMgr.fCurrSld.fSldHdr.goToBlk(this.fTarget);
	return false;
}
/** PresMgr.sBtnMgr : Buttons manager - this = button */
scHPS.PresMgr.sBtnMgr = function(){
	const vPresMgr = this.fMgr;
	switch(this.fName){
		case "btnNxt":
			vPresMgr.next();break;
		case "btnPrv":
			vPresMgr.previous();break;
		case "btnZmCls":
			vPresMgr.xHideZoom();break;
		case "btnAltSldCls":
			vPresMgr.xHideAltSlide();break;
	}
	vPresMgr.xResetFocus();
	return false;
}

/** == scHPS.SldMgr : Slide manager class ======================================
 * @param pRootNode : node - slide root node.
 * @param pSldHdr : object - slide handler. */
scHPS.SldMgr = function(pRootNode,pSldHdr){
	try{
		this.fSldHdr = pSldHdr;
		this.fSldHdr.setSldMgr(this);
		this.fRootNode = pRootNode;
		this.fWin = window;
		this.fPresMgr = this.fSldHdr.getPresMgr();
		this.fBindBlks = [];
		// Init constants
		this.fBlksPath = scHPS.fBlksPath;
		this.fDefaultAnimStep = scHPS.fDefaultAnimStep;
	}catch(e){console.error("ERROR SldMgr : "+e);}
}
scHPS.SldMgr.prototype = {
	/* --- Public ------------------------------------------------------------- */
	/** SldMgr.setBlocksPath */
	setBlocksPath : function(pBlocksPath){
		this.fBlksPath = pBlocksPath;
	},
	/** SldMgr.onLoad : Appelé par le presMgr parent, pas par le framework standard scOnLoads. */
	onLoad : function(){
		try{
			const vBod = this.fWin.document.body;
			if (!this.fRootNode) this.fRootNode = scPaLib.findNode(this.fRootPath, this.fWin.document);
			this.fBlksRoot = scPaLib.findNode(this.fBlksPath, this.fRootNode);
			if (!this.fBlksRoot) throw "Slide block root node not found."
			//Save init table col widths
			const vCols = scPaLib.findNodes("des:col", this.fRootNode);
			for (let i = 0; i < vCols.length; i++) if(!isNaN(vCols[i].width)) vCols[i].fDefaultWidth = vCols[i].width;
			//Set sizes
			this.xFixRatioNormalScreen();
			this.xFixBlocksRootSize();
			//Abonnement au resize
			scSiLib.addRule(vBod, this);
		}catch(e){console.error("ERROR SldMgr.onLoad : "+e);}
	},
	/** SldMgr.getBlksRoot */
	getBlksRoot : function(){
		return this.fBlksRoot;
	},
	/** SldMgr.getBlksAvailHeight */
	getBlksAvailHeight : function(){
		return this.fBlksRoot.offsetHeight;
	},
	/** SldMgr.getBlksAvailWidth */
	getBlksAvailWidth : function(){
		return this.fBlksRoot.offsetWidth;
	},
	/** SldMgr.getRatioNormalScreen */
	getRatioNormalScreen : function(){
		return this.fRatioNormalScreen;
	},
	/** SldMgr.addBindableBlk : Add a bindable block for processing by onLoad(). */
	addBindableBlk : function(pPath, pOpt, pBkConstructor){
		this.fBindBlks.push({fPath : pPath, fOpt : pOpt, fConst : pBkConstructor});
	},
	/** SldMgr.findOwnerBlk : Return the block that is ancestor to the specified element. */
	findOwnerBlk : function(pElt){
		if (pElt === this.fBlksRoot) return pElt;
		let vAncs = [pElt];
		vAncs = vAncs.concat(scPaLib.findNodes("anc:", pElt));
		for(let i=0; i < vAncs.length; i++) if (vAncs[i] === this.fBlksRoot || scPaLib.checkNode(this.fPresMgr.fCoBlocksRootFilterComp, vAncs[i])) return vAncs[i-1];
		return null;
	},
	/** SldMgr.bindBlks : bind all blocks (images, animations) in a given root */
	bindBlks : function(pRoot, pHdr){
		pHdr = pHdr || this.fSldHdr;
		for(let i=0; i < this.fBindBlks.length; i++) this.xBindBlk(this.fBindBlks[i].fPath, this.fBindBlks[i].fOpt, this.fBindBlks[i].fConst, pRoot, pHdr);
	},
	/** SldMgr.onResizedAnc : Api scSiLib. */
	onResizedAnc : function(pOwnerNode, pEvent){
		//Resize du slide.
		if(pEvent.phase===1) {
			this.xFixRatioNormalScreen();
			this.xFixBlocksRootSize();
		} else {
			this.fPresMgr.redrawSlideZone();
		}
	},
	/** SldMgr.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** SldMgr.ruleSortKey : Api scSiLib. */
	ruleSortKey : "AA",

	/* --- Private ------------------------------------------------------------ */
	/** SldMgr.xBindBlk */
	xBindBlk : function(pPath, pOpt, pBkConstructor, pRoot, pHdr){
		pOpt = pOpt || {};
		pOpt.fSldMgr = this;
		pOpt.fHdr = pHdr;
		pRoot = pRoot || this.fBlksRoot;
		const vBlks = scPaLib.findNodes(pPath, pRoot);
		for(let i=0; i < vBlks.length; i++) {
			new pBkConstructor(vBlks[i], pOpt);
		}
	},
	/** SldMgr.xFixBlocksRootSize */
	xFixBlocksRootSize : function(){
		const vBodyH = this.xRootHeight();
		const vTop = this.fBlksRoot.offsetTop;
		this.fBlksRoot.style.height = Math.max(50, vBodyH - vTop)+"px";
	},
	/** SldMgr.xRootHeight */
	xRootHeight : function() {
		return scCoLib.toInt(this.fRootNode.style.pixelHeight || this.fRootNode.offsetHeight);
	},
	/** SldMgr.xRootWidth */
	xRootWidth : function() {
		return scCoLib.toInt(this.fRootNode.style.pixelWidth || this.fRootNode.offsetWidth);
	},
	/** SldMgr.xFixRatioNormalScreen */
	xFixRatioNormalScreen : function(){
		this.fRatioNormalScreen = Math.sqrt(this.xRootHeight() / 600 * this.xRootWidth() / 800);
		const vBaseFontSize = Math.round(this.fRatioNormalScreen * this.fPresMgr.fDefaultFontSize);
		this.fRootNode.style.fontSize = vBaseFontSize+"px";
		// Adapt table col width
		const vCols = scPaLib.findNodes("des:col");
		for (let i = 0; i < vCols.length; i++) if(vCols[i].fDefaultWidth) vCols[i].width = Math.round(this.fRatioNormalScreen * vCols[i].fDefaultWidth);
	},
	/** SldMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pFunc, pClassName, pCapt, pTitle, pNxtSib) {
		return scHPS.xAddBtn(pParent, this, pFunc, pClassName, pCapt, pTitle, pNxtSib);
	}
}

/* =============================================================================
	 * Handlers
	 * ========================================================================== */

/** == scHPS.SldHdr : Handler de slide standard. ============================ */
scHPS.SldHdr = function(pId, pPresMgr){
	this.fSldIdx = pId;
	this.fPresMgr = pPresMgr;
	this.fCurrBlk = null;
	this.fBlkCount = 0;
}
scHPS.SldHdr.prototype = {
	/** SldHdr.initSld */
	initSld : function(){
		this.fCurrBlk = null;
		//Load
		const vSubSldMgr = this.getSldMgr();
		vSubSldMgr.onLoad();
		// Init Blocks
		this.fBlksRoot = vSubSldMgr.getBlksRoot();
		this.fBlks = this.fPresMgr.xInitBlocks(this, this.fBlksRoot);
	},
	/** SldHdr.getPresMgr */
	getPresMgr : function() {
		return this.fPresMgr;
	},
	/** SldHdr.setSldMgr */
	setSldMgr : function(pSldMgr) {
		this.fSldMgr = pSldMgr;
	},
	/** SldHdr.getSldMgr */
	getSldMgr : function() {
		return this.fSldMgr;
	},
	/** SldHdr.getFirstBlock */
	getFirstBlock : function() {
		return this.fBlks ? this.fBlks[0] : null;
	},
	/** SldHdr.getLastBlock */
	getLastBlock : function() {
		return this.fBlks ? this.fBlks[this.fBlks.length-1] : null;
	},
	/** SldHdr.getCurrBlk */
	getCurrBlk : function(){
		return this.fCurrBlk;
	},
	/** SldHdr.getCurrBlkIdx */
	getCurrBlkIdx : function(){
		return (this.fCurrBlk?this.fCurrBlk.fIdx:0);
	},
	/** SldHdr.getCurrBlkCounter */
	getCurrBlkCounter : function(){
		if (!this.fCurrBlk) return 0;
		return this.fCurrBlk.fBlkHdr.getCurrBlkCounter ? this.fCurrBlk.fBlkHdr.getCurrBlkCounter() : this.fCurrBlk.fCount;
	},
	/** SldHdr.getNextBlock */
	getNextBlock : function(){
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.hasNextBlock()) return this.fCurrBlk.fBlkHdr.getNextBlock();
			if(this.fCurrBlk.fBlkHdr.fBlkIdx < this.fBlks.length - 1) {
				let vNxt = this.fBlks[this.fCurrBlk.fBlkHdr.fBlkIdx+1];
				if(vNxt.fBlkHdr.hasNextBlock()) return vNxt.fBlkHdr.getNextBlock();
				return vNxt;
			}
		}
		return null;
	},
	/** SldHdr.goToNxt : Navigue à l'intérieur du slide (ie dans les blocks et steps) pour avancer d'un cran. */
	goToNxt : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		let vNxt;
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.goToNxt()) return true;
			vNxt = this.fBlks[this.fCurrBlk.fBlkHdr.fBlkIdx+1];
		} else {
			vNxt = this.fBlks[0];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrBlk, vNxt, "F");
			return true;
		}
		return false;
	},
	/** SldHdr.goToPrv : Navigue à l'intérieur du slide (ie dans les blocks et steps) pour reculer d'un cran. */
	goToPrv : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		let vNxt;
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.goToPrv()) return true;
			vNxt = this.fBlks[this.fCurrBlk.fBlkHdr.fBlkIdx-1];
		} else {
			vNxt = this.fBlks[this.fBlks.length-1];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrBlk, vNxt, "L");
			return true;
		}
		return false;
	},
	/** SldHdr.goToBlk : Navigue à l'intérieur du slide pour atteindre un block. */
	goToBlk : function(pBlk){
		if(pBlk) {
			const iHideAll = function (pHdr) {
				const vSubs = pHdr.fBlks || pHdr.fSubBlocks;
				if (vSubs) {
					for (let i = 0; i < vSubs.length; i++) {
						scHPS.xEndOpacityEffect(vSubs[i], 0, true);
						if (vSubs[i].fBlkHdr && vSubs[i].fBlkHdr.fSubBlocks) iHideAll(vSubs[i].fBlkHdr);
					}
				}
			};
			iHideAll(this);
			this.fPresMgr.fSwitchBlkTask.initTask(null, pBlk, "F");
			vHdr = pBlk.fBlkHdr
			while (vHdr.fParentHdr){
				vHdr = vHdr.fParentHdr;
				if (vHdr.fBlkNode) scHPS.xEndOpacityEffect(vHdr.fBlkNode, 1);
			}
			vHdr = pBlk.fBlkHdr
			while (vHdr.fParentHdr){
				vHdr.fParentHdr.setCurrBlock(vHdr.fBlkNode);
				vHdr = vHdr.fParentHdr;
			}
			return true;
		}
		return false;
	},
	/** SldHdr.hasNext */
	hasNext : function(){
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.hasNext()) return true;
			return this.fCurrBlk.fBlkHdr.fBlkIdx < this.fBlks.length - 1;
		} else return this.fBlks.length > 1;
	},
	/** SldHdr.hasNextBlock */
	hasNextBlock : function(){
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.hasNextBlock()) return true;
			return this.fCurrBlk.fBlkHdr.fBlkIdx < this.fBlks.length - 1;
		} else return this.fBlks.length > 1;
	},
	/** SldHdr.hasPrevious */
	hasPrevious : function(){
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.hasPrevious()) return true;
			return this.fCurrBlk.fBlkHdr.fBlkIdx > 0;
		} else return this.fBlks.length > 1;
	},
	/** SldHdr.hasPreviousBlock */
	hasPreviousBlock : function(){
		if(this.fCurrBlk) {
			return this.fCurrBlk.fBlkHdr.fBlkIdx > 0;
		} else return this.fBlks.length > 1;
	},
	/** SldHdr.redrawSld */
	redrawSld : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		//On redessine le block en cours et invalide les autres blocks.
		let i = 0;
		const vLen = this.fBlks.length;
		for(; i < vLen; i++) {
			const vBlk = this.fBlks[i];
			if(vBlk === this.fCurrBlk) {
				vBlk.fBlkHdr.redrawBlk();
			} else {
				vBlk.fBlkHdr.invalidateSize();
			}
		}
	},
	/** SldHdr.invalidateSize */
	invalidateSize : function(){
		for(let i = 0; i < this.fBlks.length; i++) {
			this.fBlks[i].fBlkHdr.invalidateSize();
		}
	},
	/** SldHdr.getAvailHeight */
	getAvailHeight : function(){
		return this.fBlksRoot.offsetHeight;
	},
	/** SldHdr.getAvailWidth */
	getAvailWidth : function(){
		return this.fBlksRoot.offsetWidth;
	},
	/** SldHdr.keyMgr */
	keyMgr : function(pCharCode){
		return this.fPresMgr.xKeyMgr(pCharCode);
	},
	/** SldHdr.showZoom */
	showZoom : function(pRes, pOpts){
		return this.fPresMgr.xShowZoom(pRes, pOpts);
	},
	/** SldHdr.hideZoom */
	hideZoom : function(){
		return this.fPresMgr.xHideZoom();
	},
	/** SldHdr.getZoomContainer */
	getZoomContainer : function(){
		return this.fPresMgr.xGetZoomContainer();
	},
	/** SldHdr.getZoomSlide */
	getZoomSlide : function(){
		return this.fPresMgr.xGetZoomSlide();
	},
	/** SldHdr.setCurrBlock */
	setCurrBlock : function(pNewBlock){
		this.fCurrBlk = pNewBlock;
		if(pNewBlock === this.fBlks[0]) this.fSldMgr.fRootNode.classList.add(this.fPresMgr.fSsClassPrefix + "firstBlock");
		else this.fSldMgr.fRootNode.classList.remove(this.fPresMgr.fSsClassPrefix + "firstBlock");
		if(pNewBlock === this.fBlks[this.fBlks.length-1]) this.fSldMgr.fRootNode.classList.add(this.fPresMgr.fSsClassPrefix + "LastBlock");
		else this.fSldMgr.fRootNode.classList.remove(this.fPresMgr.fSsClassPrefix + "LastBlock");
	},
	/** SldHdr.isFirstSld */
	isFirstSld : function(){
		return this.fSldIdx === this.fPresMgr.fFirstLocalIdx;
	},
	/** SldHdr.isZoomSld */
	isZoomSld : function(){
		return false;
	},
	/** SldHdr.isLastSld */
	isLastSld : function(){
		return this.fSldIdx === 0 - 1;
	},
	/** SldHdr.showAltSlide */
	showAltSlide : function(pRes, pOpts){
		return this.fPresMgr.xShowAltSlide(pRes, pOpts);
	}
}

/** == scHPS.SldAltHdr : Handler de slide alternatif. ================ */
scHPS.SldAltHdr = function(pPresMgr){
	this.fSldIdx = -9999;
	this.fPresMgr = pPresMgr;
	this.fCurrBlk = null;
	this.fBlkCount = 0;
}
scHPS.SldAltHdr.prototype = new scHPS.SldHdr();

/** == scHPS.FraZmHdr : Handler d'url dans une iframe en zoom. ============== */
scHPS.FraZmHdr = function(pNode, pUrl, pPresMgr){
	this.fZmNode = pNode;
	this.fPresMgr = pPresMgr;
	this.fUrl = pUrl;
	this.fCurrBlk = null;
}
/** FraZmHdr.init */
scHPS.FraZmHdr.prototype.init = function(){
	this.fFraNode = scDynUiMgr.addElement("iframe", this.fZmNode, "slideFra");
	this.fFraNode.fFraHdr = this;
	this.fCurrBlk = null;
	this.fFraNode.src = this.fUrl;
}

/** == scHPS.BlkHdr : Handler de blocks dans un slide. ====================== */
scHPS.BlkHdr = function(pParentHdr, pBlkNode, pBlkIdx){
	let i;
	if (pBlkNode.fHasHandeler) throw "Block already part of a handeler.";
	pBlkNode.fHasHandeler = true;
	this.fParentHdr = pParentHdr;
	this.fBlkNode = pBlkNode;
	this.fBlkIdx = pBlkIdx;
	this.fPresMgr = this.fParentHdr.getPresMgr();
	this.fSldMgr = this.fParentHdr.getSldMgr();
	this.fBlkContent = scPaLib.findNode(this.fPresMgr.fBlkCoPathComp, this.fBlkNode);
	if (!this.fBlkContent) {
		throw "Block content node not found."
	}
	//Init du positionnement
	this.xResetSizeStepsAndBlocks();
	//Init des blocks dans le content de cet handeler
	this.fParentHdr.getSldMgr().bindBlks(this.fBlkContent, this);
	/** n° de l'étape en cours. */
	this.fCurrStep = -1;
	// Recherche de tous les points de coupe possibles.
	const vSteps = [this.fBlkContent].concat(scPaLib.findNodes("des:" + this.fPresMgr.fCutableFilter, this.fBlkContent));
	this.fAllSteps = [];
	this.fForcedSteps = [];
	for (i = 0; i < vSteps.length; i++) {
		const vStep = vSteps[i];
		let vLastStep = null;
		if(!scPaLib.findNode("anc:"+this.fPresMgr.fUncutableFilter,vStep)){
			// On ne prend pas en compte ceux qui sont contenus dans un élément "Uncutable".
			if(this.fAllSteps.length > 0) vLastStep = this.fAllSteps[this.fAllSteps.length-1];
			vStep.fOpacityPrv = vStep.getAttribute("data-mask-opacity-prv") || scHPS.fStepMaskOpacityPrv;
			vStep.fOpacityNxt = vStep.getAttribute("data-mask-opacity-nxt") || scHPS.fStepMaskOpacityNxt;
			if(scPaLib.checkNode(this.fPresMgr.fFixedHeightFilterComp,vStep)) vStep.fFixedHeight = true;
			if(scPaLib.checkNode(this.fPresMgr.fForcedCutFilterComp,vStep)) {
				vStep.fForced = true;
				vStep.fForcedMask = true;
				this.fForcedSteps.push(vLastStep);
			}
			if (!vLastStep || (scHPS.xGetOffsetTop(vStep, this.fBlkContent) > scHPS.xGetOffsetTop(vLastStep, this.fBlkContent) && vLastStep.firstChild !== vStep)){
				// On est sur le premier step OU l'OffsetTop du step est supérieur au dernier step pris en compte et le step n'est pas le firstChild du dernier step pris en compte.
				this.fAllSteps.push(vStep);
			} else if ((vLastStep && scHPS.xGetOffsetTop(vStep, this.fBlkContent) === scHPS.xGetOffsetTop(vLastStep, this.fBlkContent) && !vLastStep.fForced) || (vLastStep.firstChild === vStep && !vLastStep.fForced)){
				// Il y a déjà au moins un step pris en compte ET l'OffsetTop du step est égal à celui du dernier step pris en compte s'il n'était pas forcé OU step est le firstChild du dernier step pris en compte.
				this.fAllSteps.pop();
				this.fAllSteps.push(vStep);
			}
		}
	}
	if (this.fForcedSteps.length > 0){
		// On flag tout step directement après un forced step également en forced
		for (i = this.fAllSteps.length-1; i >0 ; i--) {
			if (this.fAllSteps[i-1].fForced) this.fAllSteps[i].fForced = true;
		}
	}
	if (this.fAllSteps.length < 2) this.fAllSteps = null;
	// Calcul des étapes en fonction de l'espace disponible.
	this.xPlanSteps();
	// Centre le block dans son container
	this.xCenterBlock();
	this.fNeedResize = false;
}
scHPS.BlkHdr.prototype = {
	/** BlkHdr.getPresMgr */
	getPresMgr : function() {
		return this.fPresMgr;
	},
	/** BlkHdr.getSldMgr */
	getSldMgr : function() {
		return this.fSldMgr;
	},
	/** BlkHdr.redrawBlk : Redraw suite à un resize. Le block est en cours... */
	redrawBlk : function(){
		let i;
//On précipite les animations en cours sur le steps.
		this.fPresMgr.fSwitchStpTask.precipitateEndTask();
		//On mémorise la situation
		const vPreviousFocusNode = this.fSteps ? this.fSteps[this.fCurrStep] : null;
		//On efface tout positionnement précédent
		this.xResetSizeStepsAndBlocks();
		//On replanifie les steps
		this.xPlanSteps();
		//On recherche la step à afficher
		if(this.fSteps) {
			//Par défaut, step 0.
			this.fCurrStep = 0;
			if(vPreviousFocusNode) {
				//Recherche directe dans le tableau des nouvelles steps
				for(i = this.fSteps.length-1; i >= 0; i--) {
					if(vPreviousFocusNode===this.fSteps[i]) {
						this.fCurrStep = i;
						break;
					}
				}
				if(this.fCurrStep===-1) {
					//Pas trouvé, on recherche vPreviousFocusNode dans tous les steps
					let vFirstFocusIdx = -1;
					for(i = this.fAllSteps.length-1; i >= 0; i--) {
						if(vPreviousFocusNode===this.fAllSteps[i]) {
							vFirstFocusIdx = i;
							break;
						}
					}
					if(vFirstFocusIdx !== -1) {
						search:
							for(i = vFirstFocusIdx-1; i >= 0; i--) {
								const vStep = this.fAllSteps[i];
								for(let j=this.fSteps.length-1; j >= 0; j--) {
									if(vStep===this.fSteps[j]) {
										//On a trouvé la l'étape qui contient vPreviousFocusNode
										this.fCurrStep = j;
										break search;
									}
								}
							}
					}
				}
			}
		} else this.fCurrStep = -1;
		// Centre le block dans son container
		this.xCenterBlock();
		// Resize ok
		this.fNeedResize = false;
		//On resize et redessine le block
		this.fPresMgr.fSwitchBlkTask.initTask(this.fBlkNode, this.fBlkNode, "S");
	},
	/** BlkHdr.invalidateSize : Invalide la taille du block. Le block n'est pas actif. */
	invalidateSize : function(){
		this.fNeedResize = true;
	},
	/** BlkHdr.fixSizeAndTarget : Calcul les dimensions du block si nécessaire et redessine les steps du block terminal (appelé par la BlkTask)
	 * @param pTarget Block/Step cible à afficher
	 * 			"F" : First
	 * 			"L" : Last
	 * 			"S" : Same : redraw suite à resize. */
	fixSizeAndTarget : function(pTarget){
		if(this.fNeedResize) {
			// Reset
			this.xResetSizeStepsAndBlocks();
			// Calcul des étapes en fonction de l'espace disponible.
			this.xPlanSteps();
			// Centre le block dans son container
			this.xCenterBlock();
			// Flag ok
			this.fNeedResize = false;
		}
		//Redraw sans animation des steps du block.
		this.fPresMgr.fSwitchStpTask.initTask(this.fBlkNode, pTarget, true);
	},
	/** BlkHdr.goToNxt : Step suivant */
	goToNxt : function(){
		return this.fPresMgr.fSwitchStpTask.initTask(this.fBlkNode, "N", false);
	},
	/** BlkHdr.goToPrv : Step précédent */
	goToPrv : function(){
		return this.fPresMgr.fSwitchStpTask.initTask(this.fBlkNode, "P", false);
	},
	/** BlkHdr.hasNext */
	hasNext : function(){
		if (this.fSteps) return this.fCurrStep < this.fSteps.length -1;
		else return false;
	},
	/** BlkHdr.getNextBlock */
	getNextBlock : function(){
		return null;
	},
	/** BlkHdr.hasNextBlock */
	hasNextBlock : function(){
		return false;
	},
	/** BlkHdr.hasPrevious */
	hasPrevious : function(){
		return this.fCurrStep > 0;
	},
	/** BlkHdr.getAvailHeight */
	getAvailHeight : function(){
		return this.fParentHdr.getAvailHeight() - this.fContentHeightDelta;
	},
	/** BlkHdr.getAvailWidth */
	getAvailWidth : function(){
		return this.fBlkContent.offsetWidth;
	},
	/** BlkHdr.xResetSizeStepsAndBlocks : Reset les step à afficher. */
	xResetSizeStepsAndBlocks : function(){
		const vBlkNodeStyle = this.fBlkNode.style;
		const vParentContentStyle = this.fBlkContent.parentNode.style;
		vBlkNodeStyle.fontSize="";
		vBlkNodeStyle.top = "";
		vBlkNodeStyle.left = "";
		vBlkNodeStyle.right = "";
		vParentContentStyle.overflow= "";
		vParentContentStyle.height= "";
		const vBlkContentStyle = this.fBlkContent.style;
		vBlkContentStyle.position = "relative";
		vBlkContentStyle.top = "";
		vBlkContentStyle.width = "";
		vBlkContentStyle.fontSize = "";
		this.fSteps = null;
		this.fContentHeightDelta = this.fBlkNode.offsetHeight - this.fBlkContent.offsetHeight;
	},
	/** BlkHdr.xPlanSteps : Planifie les steps à afficher. */
	xPlanSteps : function(){
		let vBestIdx;
		let vMask;
		let i;
		this.fSteps = null;
		this.fFontSize = 100;
		const vBlkContentStyle = this.fBlkContent.style;
		const vParentContentStyle = this.fBlkContent.parentNode.style;
		const vHasForcedSteps = this.fForcedSteps.length > 0;
		const vAvailH = this.fParentHdr.getAvailHeight();
		let vRealH = this.fBlkNode.offsetHeight;
		if(vRealH < vAvailH && !vHasForcedSteps) {
			//Pas besoin de créer des steps
			this.xRemoveMasks();
			return;
		}
		//On tente un léger resize de la police par incréments
		if(vRealH > vAvailH) {
			let vStep = this.fPresMgr.fFontAutoZoomSteps;
			while (vStep > 0 && vRealH > vAvailH){
				vStep--;
				this.fFontSize -= this.fPresMgr.fFontAutoZoomDecrment;
				vBlkContentStyle.fontSize = this.fFontSize + "%";
				vRealH = this.fBlkNode.offsetHeight;
			}
			if(vRealH < vAvailH && !vHasForcedSteps) {
				//Pas besoin de créer des steps
				this.xRemoveMasks();
				return;
			}
		}
		//Si pas de steps, on tente de garantir que le 100% du contenu sera affiché à l'écran.
		if(!this.fAllSteps || this.fAllSteps.length===1) {
			while (this.fFontSize > 10 && vRealH > vAvailH){
				this.fFontSize -=1;
				vBlkContentStyle.fontSize = this.fFontSize + "%";
				vRealH = this.fBlkNode.offsetHeight;
			}
			return;
		}
		//On crée les steps (si on a des marqueurs)
		//On fige les dimensions du content du block
		const vContentH = Math.max(20, this.getAvailHeight());
		vBlkContentStyle.position = "absolute";
		vBlkContentStyle.width = "100%";
		vBlkContentStyle.top = "0px";
		vParentContentStyle.overflow = "hidden";
		vParentContentStyle.height = vContentH+"px";
		//On tente de garantir que le 100% du contenu sera affiché à l'écran.
		while (this.fFontSize > 10 && this.xGetMaxStepHeight() > vContentH){
			this.fFontSize -=1;
			vBlkContentStyle.fontSize = this.fFontSize + "%";
		}
		//Le 1er step est nécessairement le content du block
		this.fSteps = [this.fAllSteps[0]];
		//Sélection des steps
		let vPreviousTop = 0;
		let vPreviousAllStepsIdx = -1;
		const vTotalSteps = this.fAllSteps.length;
		//Fonction de calcul du score de chaque point de coupe
		const vBlkContent = this.fBlkContent;
		const vPresMgr = this.fPresMgr;

		function score(pNode){
			try{
				const vTop = scHPS.xGetOffsetTop(pNode, vBlkContent);
				let vH = vTop - vPreviousTop;
				if(vH > vContentH) return -1;
				//Malus en fonction de la profondeur de cuttable au dessus
				let vP = pNode.parentNode;
				while(vP !== vBlkContent) {
					if(scPaLib.checkNode(vPresMgr.fCutableFilterComp, vP)) vH *= .7;
					vP = vP.parentNode;
				}
				//Malus si le dernier step devient plus petit que celui-là
				if( vRealH - vTop < vTop - vPreviousTop) vH -= (vContentH - (vRealH - vTop))/2;
				return 1000000 + vH;
			}catch(e){console.warn("WARNING : BlkHdr.xPlanSteps.score : "+e);}
		}
		do {
			let vBestScore = -1;
			vBestIdx = -1;
			for(i = vPreviousAllStepsIdx+1; i<vTotalSteps; i++) {
				if (this.fAllSteps[i].fForced){
					vBestIdx = i;
					break;
				}
				const vScore = score(this.fAllSteps[i]);
				if(vScore > vBestScore) {
					vBestScore = vScore;
					vBestIdx = i;
				} else if(vScore<0) {
					//si <0 : hors zone visible.
					break;
				}
			}
			if(vBestIdx>=0) {
				const vNode = this.fAllSteps[vBestIdx];
				this.fSteps.push(vNode);
				vPreviousTop = scHPS.xGetOffsetTop(vNode, vBlkContent);
				vPreviousAllStepsIdx = vBestIdx;
			}
		} while(vBestIdx>=0 && (vRealH-vPreviousTop > vContentH || vHasForcedSteps));
		//On crée le tableau des masks
		if(! this.fMasks) this.fMasks = [];
		//On crée autant de masks que de steps
		let vBgColor = scDynUiMgr.readStyle(this.fBlkContent, "backgroundColor") || "white";
		if(vBgColor==="transparent" || vBgColor.search(/rgba\([0-9 ]*,[0-9 ]*,[0-9 ]*,\s?0\s?\)/)>-1) vBgColor = scDynUiMgr.readStyle(this.fBlkNode, "backgroundColor") || "white";
		if(vBgColor==="transparent" || vBgColor.search(/rgba\([0-9 ]*,[0-9 ]*,[0-9 ]*,\s?0\s?\)/)>-1) vBgColor = "white";
		for(i = this.fMasks.length; i < this.fSteps.length; i++) {
			const vStep = this.fSteps[i];
			vMask = scDynUiMgr.addElement("div", this.fBlkContent, "ssMask "+(vStep.fForcedMask ? "ssForced" : ""));
			vMask.style.position = "absolute";
			vMask.style.left = "0px";
			vMask.style.width = "100%";
			vMask.style.height = "0px";
			vMask.style.backgroundColor = vBgColor;
			vMask.fOpacityPrv = vStep.fOpacityPrv;
			vMask.fOpacityNxt = vStep.fOpacityNxt;
			scHPS.xStartOpacityEffect(vMask,1);
			this.fMasks[i] = vMask;
		}
		//On purge les masks en trop
		for(i = this.fSteps.length; i < this.fMasks.length; i++) {
			vBlkContent.removeChild(this.fMasks[i]);
		}
		this.fMasks.length = this.fSteps.length;
		//On place les masks.
		let vPreviousBottom = 0;
		const vLastIdx = this.fSteps.length - 1;
		for(i = 0; i <= vLastIdx; i++) {
			vMask = this.fMasks[i];
			const vNextTop = i < vLastIdx ? scHPS.xGetOffsetTop(this.fSteps[i + 1], vBlkContent) - this.fSteps[i + 1].clientTop : vBlkContent.offsetHeight;
			vMask.style.top = vPreviousBottom+"px";
			vMask.style.height = (vNextTop - vPreviousBottom)+"px";
			vMask.style.display="";
			scHPS.xSetOpacity(vMask, vMask.fOpacityNxt);
			vPreviousBottom = vNextTop;
		}
	},
	/** BlkHdr.xGetMaxStepHeight */
	xGetMaxStepHeight : function(){
		let vMaxStepHeight = 0;
		for(let i = 0; i<this.fAllSteps.length; i++) {
			if(!this.fAllSteps[i].fFixedHeight) vMaxStepHeight = Math.max(vMaxStepHeight, (i===this.fAllSteps.length-1 ? this.fAllSteps[i].offsetHeight : scHPS.xGetOffsetTop(this.fAllSteps[i+1], this.fBlkContent) - (i>0 ? scHPS.xGetOffsetTop(this.fAllSteps[i], this.fBlkContent) : 0)));
		}
		return vMaxStepHeight;
	},
	/** BlkHdr.xCenterBlock */
	xCenterBlock : function() {
		if (this.fBlkNode.getAttribute("data-maximize")) return;
		const vParentHdr = this.fParentHdr;
		let vAvailH = vParentHdr.getAvailHeight();
		let vH = this.fBlkNode.offsetHeight;
		let vMargin = 0;
		if(vH < vAvailH && this.fFontSize===100) {
			const vAvailW = vParentHdr.getAvailWidth();
			if(vAvailW > scHPS.fBlkMinWidth) {
				vMargin = Math.round(Math.min( vAvailW * scHPS.fBlkMaxMargin * (1 - vH / vAvailH), (vAvailW - scHPS.fBlkMinWidth)/2));
			}
		}
		this.fBlkNode.style.left = vMargin + "px";
		this.fBlkNode.style.right = vMargin + "px" ;
		vAvailH = vParentHdr.getAvailHeight();
		vH = this.fBlkNode.offsetHeight;
		if(vH < vAvailH) {
			this.fBlkNode.style.top = Math.round( (vAvailH-vH) * scHPS.fBlkTopSpace)+"px";
		}
	},
	/** BlkHdr.xSetCurrStep : affecte la step stabilisée (appelé par fSwitchStpTask) */
	xSetCurrStep : function(pCurrStep){
		this.fCurrStep = pCurrStep;
	},
	/** BlkHdr.xRemoveMasks : supprime tous les masks d'un block. */
	xRemoveMasks : function(){
		if(!this.fMasks) return;
		for(let i = this.fMasks.length-1; i >=0; i--) {
			this.fBlkContent.removeChild(this.fMasks[i]);
		}
		this.fMasks = null;
	}
}
/** == scHPS.BlkCoHdr : Handler de blocks de type container de sous-blocks. = */
scHPS.BlkCoHdr = function(pParentHdr, pBlkCoNode, pBlkIdx){
	if (pBlkCoNode.fHasHandeler) throw "Container block already part of a handler.";
	pBlkCoNode.fHasHandeler = true;
	this.fParentHdr = pParentHdr;
	this.fBlkNode = pBlkCoNode;
	this.fBlkIdx = pBlkIdx;
	this.fPresMgr = this.fParentHdr.getPresMgr();
	this.fSldMgr = this.fParentHdr.getSldMgr();
	// Racine des blocks du/des container(s).
	this.fBlksRoot = scPaLib.findNode(this.fPresMgr.fCoBlocksRootPathComp, this.fBlkNode);
	if (!this.fBlksRoot) throw "Container block root node not found.";
	this.fAltBlksRoot = scPaLib.findNode(this.fPresMgr.fCoAltBlocksRootPathComp, this.fBlksRoot);
	// Fixe les dim du/des container(s)
	this.xFixContainerSize();
	// Init les blocks de ce container
	this.fSubBlocks = this.fPresMgr.xInitBlocks(this, this.fBlksRoot);
	// Init alternative blocs
	if (this.fAltBlksRoot) {
		this.fAltBlocks = this.fPresMgr.xInitBlocks(this, this.fAltBlksRoot);
		this.fBtnAltCls = this.fPresMgr.xAddBtn(this.fAltBlksRoot, "btnZmCls", scHPS.xGetStr(4), scHPS.xGetStr(4));
		this.fBtnAltCls.fBlkCoHdr = this;
		this.fBtnAltCls.onclick = function(){this.fBlkCoHdr.closeAlt(); return false;};
		this.fBtnAltCls.style.visibility="hidden";
		this.fBtnAltCls.setAttribute("aria-hidden", "true");
		const vAltMenuItems = scPaLib.findNodes(this.fPresMgr.fCoAltBlocksMenuPathComp, this.fBlksRoot);
		if (vAltMenuItems.length !== this.fAltBlocks.length) throw "Container alternative block menu not found.";
		for (let i=0; i<vAltMenuItems.length; i++){
			const vAltMenuItem = vAltMenuItems[i];
			vAltMenuItem.fBlkCoHdr = this;
			vAltMenuItem.fIdx = i;
			vAltMenuItem.onclick = function(){this.fBlkCoHdr.goToAlt(this.fIdx); return false;};
		}
	}
	this.fAltBlockAct = false;
	// Sous-bloc en cours.
	this.fCurrSubBlk = null;
	scSiLib.addRule(pBlkCoNode, this);
}
scHPS.BlkCoHdr.prototype = {
	/** BlkCoHdr.getPresMgr */
	getPresMgr : function() {
		return this.fPresMgr;
	},
	/** BlkCoHdr.getSldMgr */
	getSldMgr : function() {
		return this.fSldMgr;
	},
	/** BlkCoHdr.getFirstBlock */
	getFirstBlock : function() {
		return this.fSubBlocks ? this.fSubBlocks[0] : null;
	},
	/** BlkCoHdr.getLastBlock */
	getLastBlock : function() {
		return this.fSubBlocks ? this.fSubBlocks[this.fSubBlocks.length-1] : null;
	},
	/** BlkCoHdr.getCurrBlk */
	getCurrBlk : function(){
		return this.fCurrSubBlk;
	},
	/** BlkCoHdr.getCurrBlkIdx */
	getCurrBlkIdx : function(){
		return (this.fCurrSubBlk?this.fCurrSubBlk.fIdx:0);
	},
	/** BlkCoHdr.getCurrBlkCounter */
	getCurrBlkCounter : function(){
		if (!this.fCurrSubBlk) return 0;
		return this.fCurrSubBlk.fBlkHdr.getCurrBlkCounter ? this.fCurrSubBlk.fBlkHdr.getCurrBlkCounter() : this.fCurrSubBlk.fCount;
	},
	/** BlkCoHdr.getNextBlock */
	getNextBlock : function(){
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.hasNextBlock()) return this.fCurrSubBlk.fBlkHdr.getNextBlock();
			if(this.fCurrSubBlk.fBlkHdr.fBlkIdx < this.fSubBlocks.length - 1) {
				let vNxt = this.fSubBlocks[this.fCurrSubBlk.fBlkHdr.fBlkIdx+1];
				if(vNxt.fBlkHdr.hasNextBlock()) return vNxt.fBlkHdr.getNextBlock();
				return vNxt;
			}
			return null;
		}
		return this.fSubBlocks[0];
	},
	/** BlkCoHdr.setCurrBlock */
	setCurrBlock : function(pNewBlock){
		this.fCurrSubBlk = pNewBlock;
		if(pNewBlock === this.fSubBlocks[0]) this.fBlkNode.classList.add(this.fPresMgr.fSsClassPrefix + "firstBlock");
		else this.fBlkNode.classList.remove(this.fPresMgr.fSsClassPrefix + "firstBlock");
		if(pNewBlock === this.fSubBlocks[this.fSubBlocks.length-1]) this.fBlkNode.classList.add(this.fPresMgr.fSsClassPrefix + "LastBlock");
		else this.fBlkNode.classList.remove(this.fPresMgr.fSsClassPrefix + "LastBlock");
	},
	/** BlkCoHdr.goToNxt : Navigue à l'intérieur du container pour avancer d'un cran. */
	goToNxt : function(){
		let vNxt;
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.goToNxt()) return true;
			if (this.closeAlt()) return true;
			vNxt = this.fSubBlocks[this.fCurrSubBlk.fBlkHdr.fBlkIdx+1];
		} else {
			vNxt = this.fSubBlocks[0];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, vNxt, "F");
			return true;
		}
		return false;
	},
	/** BlkCoHdr.goToPrv : Navigue à l'intérieur du container pour reculer d'un cran. */
	goToPrv : function(){
		let vNxt;
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.goToPrv()) return true;
			if (this.closeAlt()) return true;
			vNxt = this.fSubBlocks[this.fCurrSubBlk.fBlkHdr.fBlkIdx-1];
		} else {
			vNxt = this.fSubBlocks[this.fSubBlocks.length-1];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, vNxt, "L");
			return true;
		}
		return false;
	},
	/** BlkCoHdr.closeAlt : ferme le block alternatif en cours. */
	closeAlt : function(){
		if (!this.fAltBlockAct) return false;
		this.fBtnAltCls.style.visibility="hidden";
		this.fBtnAltCls.setAttribute("aria-hidden", "true");
		this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, this.fPausedSubBlk, "F");
		this.fAltBlockAct = false;
		this.fPresMgr.xNotifyListeners("onAction", "hideAltBlock");
		return true;
	},
	/** BlkCoHdr.goToAlt : démarre un block alternatif. */
	goToAlt : function(pIdx){
		if(!this.fAltBlksRoot) return false;
		if(this.fAltBlockAct){
		} else {
			this.fPausedSubBlk = this.fCurrSubBlk;
			this.fBtnAltCls.style.visibility="";
			this.fBtnAltCls.removeAttribute("aria-hidden");
		}
		this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, this.fAltBlocks[pIdx], "F");
		this.fAltBlockAct = true;
		this.fPresMgr.xNotifyListeners("onAction", "showAltBlock");
	},
	/** BlkCoHdr.hasNext */
	hasNext : function(){
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.hasNext()) return true;
			return this.fCurrSubBlk.fBlkHdr.fBlkIdx < this.fSubBlocks.length - 1;
		} else return this.fSubBlocks.length > 1;
	},
	/** BlkCoHdr.hasNextBlock */
	hasNextBlock : function(){
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.hasNextBlock()) return true;
			return this.fCurrSubBlk.fBlkHdr.fBlkIdx < this.fSubBlocks.length - 1;
		} else return this.fSubBlocks.length > 1;
	},
	/** BlkCoHdr.hasPrevious */
	hasPrevious : function(){
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.hasPrevious()) return true;
			return this.fCurrSubBlk.fBlkHdr.fBlkIdx > 0;
		} else return this.fSubBlocks.length > 1;
	},
	/** BlkCoHdr.redrawBlk */
	redrawBlk : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		//On redessine le block en cours et invalide les autres blocks.
		let i = 0;
		const vLen = this.fSubBlocks.length;
		for(; i < vLen; i++) {
			const vBlk = this.fSubBlocks[i];
			if(vBlk === this.fCurrSubBlk) {
				vBlk.fBlkHdr.redrawBlk();
			} else {
				vBlk.fBlkHdr.invalidateSize();
			}
		}
	},
	/** BlkCoHdr.invalidateSize : Invalide la taille du block. Le block n'est pas actif. */
	invalidateSize : function(){
		let i = 0;
		const vLen = this.fSubBlocks.length;
		for(; i < vLen; i++) {
			this.fSubBlocks[i].fBlkHdr.invalidateSize();
		}
		this.fNeedResize = true;
	},
	/** BlkCoHdr.fixSizeAndTarget : Calcul les dimensions du block si nécessaire et redessine les sous-blocs et les steps du block terminal (appelé par la BlkTask)
	 * @param pTarget Block/Step cible à afficher
	 * 			"F" : First
	 * 			"L" : Last
	 * 			"S" : Same : redraw suite à resize. */
	fixSizeAndTarget : function(pTarget){
		if(this.fNeedResize) this.xFixContainerSize();
		let vNewSubBlk;
		switch(pTarget) {
			case "F" : {
				vNewSubBlk = this.getFirstBlock();
				break;
			}
			case "L" : {
				vNewSubBlk = this.getLastBlock();
				break;
			}
			case "S" : {
				vNewSubBlk = this.fCurrSubBlk;
				break;
			}
		}
		if(vNewSubBlk) {
			//Gestion de l'affichage instantané des sous-blocs.
			if(this.fCurrSubBlk && this.fCurrSubBlk !== vNewSubBlk) {
				scHPS.xEndOpacityEffect(this.fCurrSubBlk, 0);
			}
			scHPS.xEndOpacityEffect(vNewSubBlk, 1);
			vNewSubBlk.fBlkHdr.fixSizeAndTarget(pTarget);
			this.setCurrBlock(vNewSubBlk);
		}
	},
	/** BlkCoHdr.getAvailHeight : Hauteur disponible pour les fils de ce container. */
	getAvailHeight : function(){
		return this.fBlksRoot.offsetHeight;
	},
	/** BlkCoHdr.getAvailWidth : Largeur disponible pour les fils de ce container. */
	getAvailWidth : function(){
		return this.fBlksRoot.offsetWidth;
	},
	/** BlkCoHdr.onResizedAnc : Api scSiLib. */
	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase===1) {
			this.xFixContainerSize();
		}
	},
	/** BlkCoHdr.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** BlkCoHdr.ruleSortKey : Api scSiLib. */
	ruleSortKey : "AA",
	/** BlkCoHdr.xFixContainerSize : Fixe la taille du container dans son contexte parent. */
	xFixContainerSize : function(){
		const vAvailH = this.fParentHdr.getAvailHeight();
		const vDeltaHeight = (this.fBlkNode.offsetHeight - this.fBlksRoot.offsetHeight - this.fBlksRoot.offsetTop) / 2;
		this.fBlksRoot.style.height = Math.max(50, vAvailH - this.fBlksRoot.offsetTop - vDeltaHeight)+"px";
		this.fNeedResize = false;
	}
}

/* =============================================================================
	 * Blocks
	 * ========================================================================== */

/** == scHPS.ActBlk : Action Block class =================================== */
scHPS.ActBlk = function(pElt, pOpt){
	if(!pElt) return;
	pElt.fOpt = pOpt || {};
	pElt.fSldMgr = pOpt.fSldMgr;
	if (pOpt.onAction) pOpt.fHdr.getPresMgr().register("onAction", pOpt.onAction, pElt);
}

/** == scHPS.AnimBlk : Animation Block class ================================= */
scHPS.AnimBlk = function(pElt, pOpt){
	if(!pElt) return;
	this.fOpt = pOpt || {};
	this.fOpt.autoStart = (typeof this.fOpt.autoStart == "undefined" ? true : this.fOpt.autoStart);
	this.fOpt.hideToolbar = (typeof this.fOpt.hideToolbar == "undefined" ? true : this.fOpt.hideToolbar);
	this.fOpt.counter = (typeof this.fOpt.counter == "undefined" ? false : this.fOpt.counter);
	this.fOpt.loop = (typeof this.fOpt.loop == "undefined" ? true : this.fOpt.loop);
	this.fOpt.soft = (typeof this.fOpt.soft == "undefined" ? true : this.fOpt.soft);
	this.fOpt.animStep = (typeof this.fOpt.animStep == "undefined" ? (this.fSldMgr && this.fSldMgr.fDefaultAnimStep ? this.fSldMgr.fDefaultAnimStep : scHPS.fDefaultAnimStep) : this.fOpt.animStep);
	this.fSldMgr = pOpt.fSldMgr;
	this.fPresMgr = this.fSldMgr.fPresMgr;
	this.fSsClassPrefix = (this.fSldMgr && this.fSldMgr.fSsClassPrefix ? this.fSldMgr.fSsClassPrefix : scHPS.fSsClassPrefix);
	this.fIdx = -1;
	this.fRateOld = [.9, .8, .7, .6, .5, .4, .3, .2, .1];
	this.fRateNew = [.1, .2, .3, .4, .5, .6, .7, .8, .9];
	this.fNxtSwitchTime = ( Date.now  ? Date.now() : new Date().getTime() ) + this.fOpt.animStep;
	this.fEndTime = this.fNxtSwitchTime + 100;
	this.fImgs = scPaLib.findNodes(this.fPathImgs, pElt);
	if (!this.fImgs || this.fImgs.length===0) return;
	for (let i = 0; i < this.fImgs.length; i++) {
		this.fImgs[i].style.position = "absolute";
		this.fImgs[i].style.visibility = "hidden";
		this.fImgs[i].setAttribute("aria-hidden", "true");
		this.fImgs[i].fRank = i+1;
		this.fImgs[i].fPrvImg = this.fImgs[(i > 0 ? i-1 : this.fImgs.length - 1)];
		this.fImgs[i].fNxtImg = this.fImgs[(i < this.fImgs.length - 1 ? i+1 : 0)];
		if (i === this.fImgs.length - 1) this.fImgs[i].fLast = true;
	}
	this.fCurrImg = this.fImgs[0];
	this.fNxtImg = this.fCurrImg.fNxtImg;
	if (this.fOpt.autoStart){
		scHPS.xStartOpacityEffect(this.fCurrImg, 1);
		scHPS.xStartOpacityEffect(this.fNxtImg, 0);
	} else{
		this.fCurrImg.style.visibility = "";
		this.fCurrImg.removeAttribute("aria-hidden");
	}
	pElt.fImgs = this.fImgs;
	pElt.style.width="100%";
	pElt.fStart = scDynUiMgr.addElement("div",pElt,this.fSsClassPrefix + "AnmStart");
	pElt.fStart.onclick = scHPS.AnimBlk.sBtnPly;
	pElt.fStart.fMgr = this;
	pElt.fStart.onmousemove = function() {scHPS.AnimBlk.sShowCtrl(pElt)};
	pElt.fCtrl = scDynUiMgr.addElement("div",pElt,this.fSsClassPrefix + "AnmCtrl");
	pElt.fBtnPrv = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnPrv,this.fSsClassPrefix+"AnmBtnPrv",scHPS.xGetStr(6),scHPS.xGetStr(7));
	pElt.fBtnPly = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnPly,this.fSsClassPrefix+"AnmBtnPly",scHPS.xGetStr(10),scHPS.xGetStr(11));
	pElt.fBtnPly.style.display = this.fOpt.autoStart ? "none" : "";
	pElt.fBtnPse = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnPse,this.fSsClassPrefix+"AnmBtnPse",scHPS.xGetStr(12),scHPS.xGetStr(13));
	pElt.fBtnPse.style.display = this.fOpt.autoStart ? "" : "none";
	pElt.fBtnNxt = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnNxt,this.fSsClassPrefix+"AnmBtnNxt",scHPS.xGetStr(8),scHPS.xGetStr(9));
	if (this.fOpt.counter){
		const vCounter = scDynUiMgr.addElement("span", pElt.fCtrl, this.fSsClassPrefix + "Counter");
		vCounter.innerHTML = " / "+this.fImgs.length;
		this.fImgRank = scDynUiMgr.addElement("span",vCounter,this.fSsClassPrefix + "Rank", vCounter.firstChild);
		this.fImgRank.innerHTML = "1";
	}
	if (this.fOpt.hideToolbar){
		pElt.fCtrl.style.visibility = "hidden";
		pElt.fCtrl.setAttribute("aria-hidden", "true");
	} else {
		pElt.fCtrl.style.visibility = "";
		pElt.fCtrl.removeAttribute("aria-hidden");
	}
	pElt.fCtrl.fOn = !this.fOpt.hideToolbar;
	pElt.onmouseover = function() {scHPS.AnimBlk.sShowCtrl(pElt)};
	this.fElt = pElt;
	pElt.fAnimBlk = this;
	this.fPlyMode = this.fOpt.autoStart ? 2 : 0;
	this.fNxtPlyMode = this.fOpt.autoStart ? 2 : 0;
	scSiLib.addRule(pElt, this);
	scTiLib.addTaskNow(this);
	this.fPresMgr.register("onAction", function(pRes) {
		if (pRes === "showZoom") scHPS.AnimBlk.sBtnPse(pElt.fAnimBlk);
	});
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.AnimBlk.prototype = {
	fPathImgs : scPaLib.compilePath("chi:"),
	/** AnimBlk.onResizedAnc : Api scSiLib. */
	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase===1) {
			try{
				let vMaxHeight = 0;
				let i;
				for (i = 0; i < pOwnerNode.fImgs.length; i++){
					vMaxHeight = Math.max(vMaxHeight,pOwnerNode.fImgs[i].clientHeight);
				}
				for (i = 0; i < pOwnerNode.fImgs.length; i++){
					pOwnerNode.fImgs[i].style.marginTop = Math.round((vMaxHeight - pOwnerNode.fImgs[i].clientHeight) / 2) + "px"
					pOwnerNode.fImgs[i].style.marginLeft = Math.round((pOwnerNode.clientWidth - pOwnerNode.fImgs[i].clientWidth) / 2) + "px"
				}
				pOwnerNode.style.height=vMaxHeight + "px";
			}catch(e){console.error("ERROR AnimBlk.onResizedAnc : "+e);}
		}
	},
	/** AnimBlk.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** AnimBlk.ruleSortKey : Api scSiLib. */
	ruleSortKey : "B",
	/** AnimBlk.setNxtPlyMode. */
	setNxtPlyMode : function(){
		if (!this.fOpt.loop && this.fCurrImg.fLast && this.fPlyMode === 2) scHPS.AnimBlk.sBtnPse(this);
		const vNow = (Date.now ? Date.now() : new Date().getTime());
		const vAddTempo = (this.fPlyMode === 2 && this.fNxtPlyMode === 2);
		this.fPlyMode = this.fNxtPlyMode;
		this.fNxtPlyMode = (this.fPlyMode !== 2 ? 0 : 2);
		if (this.fPlyMode !== 0) {
			this.fNxtSwitchTime = vNow + (vAddTempo ? this.fOpt.animStep : 0);
			this.fEndTime = this.fNxtSwitchTime + 100;
			this.fNxtImg = (this.fPlyMode < 0 ? this.fCurrImg.fPrvImg : this.fCurrImg.fNxtImg);
		}
	},
	/** AnimBlk.execTask. */
	execTask : function(){
		try{
			const vNow = (Date.now ? Date.now() : new Date().getTime());
			if(this.fPlyMode !== 0 && this.fNxtSwitchTime < vNow){
				if (!this.fOpt.soft){
					scHPS.xEndOpacityEffect(this.fCurrImg, 0);
					scHPS.xEndOpacityEffect(this.fNxtImg, 1);
					this.fCurrImg = this.fNxtImg;
					if (this.fImgRank) this.fImgRank.innerHTML = this.fCurrImg.fRank;
					this.fIdx = -1;
					this.setNxtPlyMode();
					return true;
				}
				if (this.fIdx < 0) {
					scHPS.xStartOpacityEffect(this.fCurrImg, 1);
					scHPS.xStartOpacityEffect(this.fNxtImg, 0);
				}
				while(this.fEndTime < vNow && this.fIdx < this.fRateOld.length) {
					this.fIdx++;
					this.fEndTime += 100;
				}
				this.fIdx++;
				this.fEndTime += 100;
				if(this.fIdx >= this.fRateOld.length) {
					scHPS.xEndOpacityEffect(this.fCurrImg, 0);
					scHPS.xEndOpacityEffect(this.fNxtImg, 1);
					this.fCurrImg = this.fNxtImg;
					if (this.fImgRank) this.fImgRank.innerHTML = this.fCurrImg.fRank;
					this.fIdx = -1;
					this.setNxtPlyMode();
					return true;
				}
				scHPS.xSetOpacity(this.fCurrImg, this.fRateOld[this.fIdx]);
				scHPS.xSetOpacity(this.fNxtImg, this.fRateNew[this.fIdx]);
			} else if (this.fPlyMode !== this.fNxtPlyMode) this.setNxtPlyMode();
		}catch(e){console.error("ERROR AnimBlk.execTask : "+e);}
		return true;
	}
}
/** AnimBlk.sBtnPrv. */
scHPS.AnimBlk.sBtnPrv = function(){
	const vAnimBlk = this.fMgr;
	vAnimBlk.fNxtPlyMode = -1;
	const vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="";
	vAnim.fBtnPse.style.display="none";
	vAnim.fStart.style.visibility = "hidden";
	vAnim.fStart.setAttribute("aria-hidden", "true");
	scHPS.AnimBlk.sShowCtrl(vAnim);
	return false;
}
/** AnimBlk.sBtnPly. */
scHPS.AnimBlk.sBtnPly = function(){
	const vAnimBlk = this.fMgr;
	vAnimBlk.fNxtPlyMode = 2;
	const vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="none";
	vAnim.fBtnPse.style.display="";
	vAnim.fStart.style.visibility = "hidden";
	vAnim.fStart.setAttribute("aria-hidden", "true");
	scHPS.AnimBlk.sShowCtrl(vAnim);
	return false;
}
/** AnimBlk.sBtnPse. */
scHPS.AnimBlk.sBtnPse = function(pMgr){
	const vAnimBlk = this.fMgr || pMgr;
	vAnimBlk.fNxtPlyMode = 0;
	const vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="";
	vAnim.fBtnPse.style.display="none";
	scHPS.AnimBlk.sShowCtrl(vAnim);
}
/** AnimBlk.sBtnNxt. */
scHPS.AnimBlk.sBtnNxt = function(){
	const vAnimBlk = this.fMgr;
	vAnimBlk.fNxtPlyMode = 1;
	const vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="";
	vAnim.fBtnPse.style.display="none";
	vAnim.fStart.style.visibility = "hidden";
	vAnim.fStart.setAttribute("aria-hidden", "true");
	scHPS.AnimBlk.sShowCtrl(vAnim);
	return false;
}
/** AnimBlk.sShowCtrl. */
scHPS.AnimBlk.sShowCtrl = function(pAnim){
	if (pAnim.fOffProc) window.clearTimeout(pAnim.fOffProc);
	if (!pAnim.fCtrl.fOn){
		new scHPS.FadeEltTask(pAnim.fCtrl, 1);
		pAnim.fCtrl.fOn = true;
	}
	if (pAnim.fAnimBlk.fOpt.hideToolbar) pAnim.fOffProc = window.setTimeout(function(){scHPS.AnimBlk.sHideCtrl(pAnim)}, 3000);
	return false;
}
/** AnimBlk.sHideCtrl. */
scHPS.AnimBlk.sHideCtrl = function(pAnim){
	if (pAnim.fCtrl.fOn){
		new scHPS.FadeEltTask(pAnim.fCtrl, 0);
		pAnim.fCtrl.fOn = false;
		pAnim.fOffProc = null;
	}
	return false;
}

/** == scHPS.FraZmBlk : frameZoom Block class ===================================
	   frameZoom block (anchors pointing to resources that need to be opened in an iframe as a zoom).*/
scHPS.FraZmBlk = function(pElt, pOpt){
	if(!pElt) return;
	pElt.fOpt = pOpt || {};
	pElt.fSldMgr = pOpt.fSldMgr;
	if (!pElt.fOpt.type) pElt.fOpt.type = "fra";
	pElt.href = pElt.href.replace(/mode=html/gi,"mode=ss");
	pElt.onclick = scHPS.FraZmBlk.sOnClickZoom;
}
/** FraZmBlk.sOnClickZoom - this == element */
scHPS.FraZmBlk.sOnClickZoom = function(){
	if (!this.fSldMgr || !this.fSldMgr.fSldHdr) return false;
	this.fSldMgr.fSldHdr.showZoom(this, this.fOpt);
	return false;
}

/** == scHPS.AltSldZmBlk : alternative slide zoom Block class ===================================
	   alternative slide zoom block (anchors pointing to local alternative slides that need to be opened as a zoom).*/
scHPS.AltSldZmBlk = function(pElt, pOpt){
	if(!pElt) return;
	pElt.fOpt = pOpt || {};
	pElt.fSldMgr = pOpt.fSldMgr;
	if (!pElt.fOpt.type) pElt.fOpt.type = "alt";
	pElt.onclick = scHPS.AltSldZmBlk.sOnClickZoom;
}
/** FraZmBlk.sOnClickZoom - this == element */
scHPS.AltSldZmBlk.sOnClickZoom = function(){
	if (!this.fSldMgr || !this.fSldMgr.fSldHdr) return false;
	this.fSldMgr.fSldHdr.showAltSlide(this, this.fOpt);
	return false;
}

/** == scHPS.SizeBlk* : Size Block classes =================================== */
/** scHPS.SizeBlk : Base size block. */
scHPS.SizeBlk = function(){}
scHPS.SizeBlk.prototype = {
	/** SizeBlk.fPathResFra. */
	fPathResFra : scPaLib.compilePath("chi:div.resFra"),
	/** SizeBlk.fPathZoom. */
	fPathZoom : scPaLib.compilePath("des:.zoom"),
	/** SizeBlk.overrideOptions. */
	overrideOptions : function(pElt){
		let vOpt = pElt.getAttribute("data-options");
		if (vOpt) {
			vOpt = JSON.parse(vOpt);
			for (let vItem in vOpt){
				this.fOpt[vItem] = vOpt[vItem];
			}
		}
	},
	/** SizeBlk.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** SizeBlk.isEltNotAlone. */
	isEltNotAlone : function(pRoot, pEltAlone){
		if(pEltAlone === pRoot) return false;
		switch(pRoot.nodeType) {
			case 1 :
				const vNm = pRoot.nodeName;
				if(vNm === "IMG" || vNm === "VIDEO" || vNm === "AUDIO" || vNm === "OBJECT" || vNm === "EMBED") return true;
				for(let vCh = pRoot.firstChild; vCh; vCh = vCh.nextSibling) if(this.isEltNotAlone(vCh, pEltAlone)) return true;
				break;
			case 3 :
				return (/\S/.test(pRoot.nodeValue));
		}
		return false;
	}
}

/** scHPS.SizeBlkImg : Image size block. */
scHPS.SizeBlkImg = function(pElt, pOpt){
	let i;
	if(!pElt) return;
	this.fOpt = pElt.fOpt = pOpt || {};
	this.overrideOptions(pElt);
	pElt.fRatio = (typeof this.fOpt.ratio == "number") ? this.fOpt.ratio : 1;
	pElt.fZoomRatio = (typeof this.fOpt.zoomRatio == "number") ? this.fOpt.zoomRatio : 1.3;
	pElt.fSldMgr = pOpt.fSldMgr;
	pElt.fHdr = pOpt.fHdr;
	const vImg = scPaLib.findNode(this.fPathImg, pElt);
	if(!vImg) {
		console.warn("SizeBlkImg - WARNING : cannot find base image element.");
		return;
	}
	pElt.fImg = vImg;
	if (vImg.getAttribute("data-vertical-align")){
		pElt.fVerticalAlignRatio = scCoLib.toInt(vImg.getAttribute("data-vertical-align")) / vImg.height;
	}
	pElt.fAreas = scPaLib.findNodes(this.fPathAreas, pElt);
	if (pElt.fAreas.length>0) {
		pElt.fHasMap = true;
		pElt.fBaseWidth = vImg.width;
		for (i = 0; i < pElt.fAreas.length; i++) pElt.fAreas[i].fCoords = pElt.fAreas[i].coords;
	}
	pElt.fResFra = scPaLib.findNode(this.fPathResFra, pElt);
	pElt.fListImg = [];
	const vListImg = scPaLib.findNodes(this.fPathListImg, pElt);
	const vLargeImg = scPaLib.findNode(this.fPathLargeImg, pElt);
	if (vLargeImg) vListImg.push(vLargeImg);
	let vImgInList = false;
	if (vListImg.length>0){
		for (i = 0; i < vListImg.length; i++){
			const vImgNode = vListImg[i];
			const vSrc = vImgNode.src || vImgNode.getAttribute("data-src");
			const vWidth = vImgNode.width || vImgNode.getAttribute("data-width");
			const vHeight = vImgNode.height || vImgNode.getAttribute("data-height");
			pElt.fListImg.push({src:vSrc, width:scCoLib.toInt(vWidth), height:scCoLib.toInt(vHeight), img:(vImgNode.nodeName.toLowerCase()==="img"? vImgNode:null)});
			if (vWidth === vImg.width && vHeight === vImg.height) vImgInList = true;
		}
	}
	if (!vImgInList) pElt.fListImg.push({src:vImg.src, width:vImg.width, height:vImg.height, img:vImg});
	pElt.fListImg.sort(function (p1, p2){return (p1.width < p2.width ? -1 : p1.width === p2.width ? 0 : 1)});
	pElt.fOriW = pElt.fListImg[pElt.fListImg.length-1].width || 500;
	pElt.fOriH = pElt.fListImg[pElt.fListImg.length-1].height || 400;
	pElt.fAspect = pElt.fOriH / pElt.fOriW;
	scSiLib.addRule(pElt, this);
	pElt.fZoom = scPaLib.findNode(this.fPathZoom, pElt);
	if(pElt.fZoom) {
		pElt.fZoom.onclick = scHPS.SizeBlkImg.sOnClickZoom;
		pElt.fZoom.fBlk = pElt;
		if (!pElt.fHasMap) pElt.fImg.onclick = scHPS.SizeBlkImg.sOnClickZoom;
		pElt.fImg.fBlk = pElt;
	}
	if (pOpt.onAction) pOpt.fHdr.getPresMgr().register("onAction", pOpt.onAction, pElt);
	if (pOpt.addOverlay && pElt.fResFra){
		pElt.fOverlay = scDynUiMgr.addElement("div", pElt.fResFra, "resOverlay", (pElt.fZoom ? pElt.fZoom : null));
		if(pElt.fZoom) {
			pElt.fOverlay.onclick = scHPS.SizeBlkImg.sOnClickZoom;
			pElt.fOverlay.fBlk = pElt;
		}
	}
	//pElt.fSizeBlk = this;
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.SizeBlkImg.prototype = new  scHPS.SizeBlk();
/** SizeBlkImg.fPathImg */
scHPS.SizeBlkImg.prototype.fPathImg = scPaLib.compilePath("chi:.resFra|.imgBase/chi:img");
/** SizeBlkImg.fPathAreas */
scHPS.SizeBlkImg.prototype.fPathAreas = scPaLib.compilePath("chi:.resFra|.imgBase/des:area");
/** SizeBlkImg.fPathListImg */
scHPS.SizeBlkImg.prototype.fPathListImg = scPaLib.compilePath("chi:.imgOthers/chi:img|span");
/** SizeBlkImg.fPathLargeImg */
scHPS.SizeBlkImg.prototype.fPathLargeImg = scPaLib.compilePath("chi:.imgLarge/chi:img|span");
/** SizeBlkImg.onResizedAnc */
scHPS.SizeBlkImg.prototype.onResizedAnc = function(pOwnerNode, pEvent){
	if(pEvent.phase===1) {
		try{
			let i;
			const vImg = pOwnerNode.fImg;
			if(!vImg) return;
			const vIsAlone = !this.isEltNotAlone(pOwnerNode.fSldMgr.findOwnerBlk(pOwnerNode), pOwnerNode);
			const vRate = pOwnerNode.fSldMgr.getRatioNormalScreen() * pOwnerNode.fRatio;
			const vWantedW = pOwnerNode.fOriW * vRate;
			const vWantedH = pOwnerNode.fOriH * vRate;
			const vMaxW = pOwnerNode.fHdr.getAvailWidth() * (this.fOpt.ratioWidth || .8);
			const vMaxH = pOwnerNode.fHdr.getAvailHeight() * (vIsAlone ? (this.fOpt.ratioHeightAlone || .9) : (this.fOpt.ratioHeight || .8)) - (this.fOpt.captionHeight || 30);
			let vFinalW;
			pOwnerNode.fZoomOn = false;
			if(vWantedW > vMaxW || vWantedH > vMaxH) {
				const vRH = vWantedH / vMaxH;
				vFinalW = (vWantedW / vMaxW > vRH) ? vMaxW : vWantedW / vRH;
				pOwnerNode.fZoomOn = true;
			} else {
				vFinalW = vWantedW;
			}
			vFinalW = Math.round(Math.min(vFinalW, pOwnerNode.fOriW));
			const vFinalH = Math.round(vFinalW * pOwnerNode.fAspect);
			const vList = pOwnerNode.fListImg;
			//if (vList.length < 2) return;
			for (i = vList.length-1; i > 0; i--) if(vList[i-1].width < vFinalW) break;
			const vImgIdx = i;
			//if (pOwnerNode.fImgIdx && pOwnerNode.fImgIdx == vImgIdx) return;
			const vImgSel = vList[vImgIdx];
			if (pOwnerNode.fImgIdx !== vImgIdx) vImg.src = vImgSel.src;
			pOwnerNode.fImgIdx = vImgIdx;
			vImg.width = Math.round(vFinalW);
			vImg.height = Math.round(vFinalH);
			if (pOwnerNode.fVerticalAlignRatio){
				vImg.style.verticalAlign = (-vFinalH*pOwnerNode.fVerticalAlignRatio)+"px";
			}
			if (pOwnerNode.fResFra){
				pOwnerNode.fResFra.style.width=Math.round(vFinalW)+"px";
				pOwnerNode.fResFra.style.height=Math.round(vFinalH)+"px";
			}
			pOwnerNode.fZoomOn = pOwnerNode.fZoom && pOwnerNode.fZoomOn && (vImgIdx < vList.length-1 || vImgSel.width>vFinalW);
			if (this.fOpt.forceZoom) pOwnerNode.fZoomOn = true;
			if (pOwnerNode.fZoom) pOwnerNode.fZoom.style.display = (pOwnerNode.fZoomOn) ? "" : "none";
			if (pOwnerNode.fOverlay) pOwnerNode.fOverlay.className = (pOwnerNode.fZoomOn) ? "resOverlay resOverlayZoom" : "resOverlay";
			else vImg.style.cursor = (pOwnerNode.fZoomOn && !pOwnerNode.fHasMap) ? "pointer" : "";
			if (pOwnerNode.fHasMap){
				const vRatio = vFinalW / pOwnerNode.fBaseWidth;
				for (i = 0; i < pOwnerNode.fAreas.length; i++){
					const vArea = pOwnerNode.fAreas[i];
					const vCoords = vArea.fCoords.split(",");
					for (let j = 0; j < vCoords.length; j++) vCoords[j] = Math.round(vCoords[j] * vRatio);
					vArea.coords = vCoords.join(",");
				}
			}
		}catch(e){console.error("ERROR SizeBlkImg.onResizedAnc : "+e);}
	}
}
/** SizeBlkImg.ruleSortKey */
scHPS.SizeBlkImg.prototype.ruleSortKey = "A";
/** SizeBlkImg.sOnClickZoom */
scHPS.SizeBlkImg.sOnClickZoom = function(pEvent) {
	const vBlk = this.fBlk;
	if (!vBlk.fZoomOn) return;
	if (!vBlk.fSldMgr || !vBlk.fSldMgr.fSldHdr) return false;
	const vSldHdr = vBlk.fSldMgr.fSldHdr;
	const vZmItm = vSldHdr.showZoom(vBlk.fImg);
	if (!vBlk.fOpt.noHideZoomOnClick) {
		vZmItm.onclick = function(){vSldHdr.hideZoom();};
		vZmItm.style.cursor = "pointer";
	} else vZmItm.style.cursor = "";
	const vCt = vSldHdr.getZoomContainer();
	const vResizer = {
		onResizedDes: function (pOwnerNode, pEvent) {
		},
		onResizedAnc: function (pOwnerNode, pEvent) {
			if (pEvent && pEvent.phase === 2) return;
			const vRate = vBlk.fSldMgr.getRatioNormalScreen() * vBlk.fZoomRatio;
			const vWantedW = vBlk.fOriW * vRate;
			const vWantedH = vBlk.fOriH * vRate;
			const vMaxW = vCt.offsetWidth;
			const vMaxH = vCt.offsetHeight;
			let vFinalW, i;
			if (vWantedW > vMaxW || vWantedH > vMaxH) {
				const vRH = vWantedH / vMaxH;
				vFinalW = (vWantedW / vMaxW > vRH) ? vMaxW : vWantedW / vRH;
			} else {
				vFinalW = vWantedW;
			}
			const vFinalH = vFinalW * vBlk.fAspect;
			const vList = vBlk.fListImg;
			for (i = vList.length - 1; i > 0; i--) if (vList[i - 1].width < vFinalW) break;
			const vImgIdx = i;
			const vImgSel = vList[vImgIdx];
			if (vBlk.fImgZmIdx !== vImgIdx) vZmItm.src = vImgSel.src;
			pOwnerNode.fImgZmIdx = vImgIdx;
			vZmItm.width = Math.round(vFinalW);
			vZmItm.height = Math.round(vFinalH);
			vZmItm.style.marginTop = Math.max(0, Math.round((vMaxH - vFinalH) / 2)) + "px";
		}
	};
	scSiLib.addRule(vZmItm, vResizer);
	vResizer.onResizedAnc(vZmItm);
	return false;
}

/** scHPS.SizeBlkObj : Embeded object size block. */
scHPS.SizeBlkObj = function(pElt, pOpt){
	if(!pElt) return;
	this.fOpt = pElt.fOpt = pOpt || {};
	this.overrideOptions(pElt);
	if (this.fOpt.pathObject) this.fPathObject = this.fOpt.pathObject;
	pElt.fRatio = (typeof this.fOpt.ratio == "number") ? this.fOpt.ratio : 1;
	pElt.fZoomRatio = (typeof this.fOpt.zoomRatio == "number") ? this.fOpt.zoomRatio : 1.3;
	pElt.fSldMgr = pOpt.fSldMgr;
	pElt.fHdr = pOpt.fHdr;
	const vObj = scPaLib.findNode(this.fPathObject, pElt);
	if(!vObj) {
		console.warn("SizeBlkObj - WARNING : cannot find base object element.");
		return;
	}
	pElt.fObj = vObj;
	if (pOpt.onResize) this.onResizedAnc = pOpt.onResize;
	else {
		const vVideoElt = scPaLib.findNode("cde:video", vObj);
		if (vVideoElt){
			if (vVideoElt.videoWidth && vVideoElt.videoHeight){
				pElt.fObj.oriW = vVideoElt.videoWidth;
				pElt.fObj.oriH = vVideoElt.videoHeight;
			} else{
				vVideoElt.fElt = pElt;
				vVideoElt.addEventListener("loadedmetadata", function (pEvt){
					this.fElt.fObj.oriW = this.videoWidth;
					this.fElt.fObj.oriH = this.videoHeight;
					scSiLib.fireResizedNode(this.fElt);
				});
			}
		}
	}
	pElt.fResFra = scPaLib.findNode(this.fPathResFra, pElt);
	scSiLib.addRule(pElt, this);
	pElt.fZoom = scPaLib.findNode(this.fPathZoom, pElt);
	if(pElt.fZoom) {
		pElt.fZoom.onclick =  pOpt.onZoom || scHPS.SizeBlkObj.sOnClickZoom;
		pElt.fZoom.fBlk = pElt;
	}
	if (pOpt.onAction) pOpt.fHdr.getPresMgr().register("onAction", pOpt.onAction, pElt);
	if (pOpt.addOverlay && pElt.fResFra){
		pElt.fOverlay = scDynUiMgr.addElement("div", pElt.fResFra, "resOverlay", (pElt.fZoom ? pElt.fZoom : null));
		pElt.fOverlay.onclick = pOpt.onZoom || scHPS.SizeBlkObj.sOnClickZoom;
		pElt.fOverlay.fBlk = pElt;
	}
	//pElt.fSizeBlk = this;
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.SizeBlkObj.prototype = new  scHPS.SizeBlk();
/** SizeBlkObj.fPathObject */
scHPS.SizeBlkObj.prototype.fPathObject = scPaLib.compilePath("des:object|video");
/** SizeBlkObj.onResizedAnc */
scHPS.SizeBlkObj.prototype.onResizedAnc = function(pOwnerNode, pEvent){
	if(pEvent.phase===1) {
		try{
			const vObj = pOwnerNode.fObj;
			if(!vObj) return;
			if(!vObj.oriW) vObj.oriW = this.fOpt.oriW || vObj.width || vObj.clientWidth || 500;
			if(!vObj.oriH) vObj.oriH = this.fOpt.oriH || vObj.height || vObj.clientHeight || 400;
			const vIsAlone = !this.isEltNotAlone(pOwnerNode.fSldMgr.findOwnerBlk(pOwnerNode), pOwnerNode);
			const vRate = pOwnerNode.fSldMgr.getRatioNormalScreen() * pOwnerNode.fRatio;
			const vWantedW = vObj.oriW * vRate;
			const vWantedH = vObj.oriH * vRate;
			const vMaxW = pOwnerNode.fHdr.getAvailWidth() * (this.fOpt.ratioWidth || .8);
			const vMaxH = pOwnerNode.fHdr.getAvailHeight() * (vIsAlone ? (this.fOpt.ratioHeightAlone || .9) : (this.fOpt.ratioHeight || .8)) - (this.fOpt.captionHeight || 30);
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
			if(pOwnerNode.fOverlay) pOwnerNode.fOverlay.className = pOwnerNode.fZoomOn ? "resOverlay resOverlayZoom" : "resOverlay";

			if (pOwnerNode.fResFra){
				pOwnerNode.fResFra.style.width=vObj.width+"px";
				pOwnerNode.fResFra.style.height=vObj.height+"px";
			}
			vObj.style.width=vObj.width+"px";
			vObj.style.height=vObj.height+"px";
			scSiLib.fireResizedNode(vObj);
		}catch(e){console.error("ERROR SizeBlkObj.onResizedAnc : "+e);}
	}
}
/** SizeBlkObj.ruleSortKey */
scHPS.SizeBlkObj.prototype.ruleSortKey = "A";
/** SizeBlkObj.sOnClickZoom */
scHPS.SizeBlkObj.sOnClickZoom = function(pEvent) {
	const vBlk = this.fBlk;
	if (!vBlk.fSldMgr || !vBlk.fSldMgr.fSldHdr) return false;
	const vSldHdr = vBlk.fSldMgr.fSldHdr;
	const vZmItm = vSldHdr.showZoom(vBlk.fObj);
	const vCt = vSldHdr.getZoomContainer();
	const vResizer = {
		onResizedDes: function (pOwnerNode, pEvent) {
		},
		onResizedAnc: function (pOwnerNode, pEvent) {
			if (pEvent && pEvent.phase === 2) return;
			const vRate = vBlk.fSldMgr.getRatioNormalScreen() * vBlk.fZoomRatio;
			const vWantedW = vBlk.fObj.oriW * vRate;
			const vWantedH = vBlk.fObj.oriH * vRate;
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
			vZmItm.style.marginTop = Math.max(0, Math.round((vMaxH - vZmItm.height) / 2)) + "px";
		}
	};
	scSiLib.addRule(vZmItm, vResizer);
	vResizer.onResizedAnc(vZmItm);
	return false;
}

/** scHPS.SizeBlkSvg : Embeded SVG size block. */
scHPS.SizeBlkSvg = function(pElt, pOpt){
	if(!pElt) return;
	this.fOpt = pElt.fOpt = pOpt || {};
	this.overrideOptions(pElt);
	if (this.fOpt.pathSvg) this.fPathSvg = this.fOpt.pathSvg;
	pElt.fRatio = (typeof this.fOpt.ratio == "number") ? this.fOpt.ratio : 1;
	pElt.fZoomRatio = (typeof this.fOpt.zoomRatio == "number") ? this.fOpt.zoomRatio : 1.3;
	pElt.fSldMgr = pOpt.fSldMgr;
	pElt.fHdr = pOpt.fHdr;
	const vSvg = scPaLib.findNode(this.fPathSvg, pElt);
	if(!vSvg) {
		console.warn("SizeBlkSvg - WARNING : cannot find base SVG element.");
		return;
	}
	if (!vSvg.getAttribute("viewBox")) vSvg.setAttribute("viewBox", "0 0 " + vSvg.width.baseVal.value + " " + vSvg.height.baseVal.value);
	pElt.fSvg = vSvg;
	pElt.fResFra = scPaLib.findNode(this.fPathResFra, pElt);
	scSiLib.addRule(pElt, this);
	pElt.fZoom = scPaLib.findNode(this.fPathZoom, pElt);
	if(pElt.fZoom) {
		pElt.fZoom.onclick = scHPS.SizeBlkSvg.sOnClickZoom;
		pElt.fZoom.fBlk = pElt;
	}
	if (pOpt.onAction) pOpt.fHdr.getPresMgr().register("onAction", pOpt.onAction, pElt);
	if (pOpt.addOverlay && pElt.fResFra){
		pElt.fOverlay = scDynUiMgr.addElement("div", pElt.fResFra, "resOverlay", (pElt.fZoom ? pElt.fZoom : null));
		pElt.fOverlay.onclick = scHPS.SizeBlkObj.sOnClickZoom;
		pElt.fOverlay.fBlk = pElt;
	}
	//pElt.fSizeBlk = this;
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.SizeBlkSvg.prototype = new  scHPS.SizeBlk();
/** SizeBlkSvg.fPathSvg */
scHPS.SizeBlkSvg.prototype.fPathSvg = scPaLib.compilePath("des:svg");
/** SizeBlkSvg.onResizedAnc */
scHPS.SizeBlkSvg.prototype.onResizedAnc = function(pOwnerNode, pEvent){
	if(pEvent.phase===1) {
		try{
			const vSvg = pOwnerNode.fSvg;
			if(!vSvg) return;
			if(!vSvg.oriW) vSvg.oriW = vSvg.width.baseVal.value || vSvg.clientWidth || 500;
			if(!vSvg.oriH) vSvg.oriH = vSvg.height.baseVal.value || vSvg.clientHeight || 400;
			const vIsAlone = !this.isEltNotAlone(pOwnerNode.fSldMgr.findOwnerBlk(pOwnerNode), pOwnerNode);
			const vRate = pOwnerNode.fSldMgr.getRatioNormalScreen() * pOwnerNode.fRatio;
			const vWantedW = vSvg.oriW * vRate;
			const vWantedH = vSvg.oriH * vRate;
			const vMaxW = pOwnerNode.fHdr.getAvailWidth() * (this.fOpt.ratioWidth || .8);
			const vMaxH = pOwnerNode.fHdr.getAvailHeight() * (vIsAlone ? (this.fOpt.ratioHeightAlone || .9) : (this.fOpt.ratioHeight || .8)) - (this.fOpt.captionHeight || 30);
			pOwnerNode.fZoomOn = false;
			if(vWantedW > vMaxW || vWantedH > vMaxH) {
				const vRW = vWantedW / vMaxW;
				const vRH = vWantedH / vMaxH;
				if(vRW > vRH) {
					vSvg.fWidth = vMaxW;
					vSvg.fHeight = vWantedH / vRW;
				} else {
					vSvg.fWidth = vWantedW / vRH;
					vSvg.fHeight = vMaxH;
				}
				pOwnerNode.fZoomOn = true;
			} else {
				vSvg.fWidth = vWantedW;
				vSvg.fHeight = vWantedH;
				pOwnerNode.fZoomOn = false;
			}
			pOwnerNode.fZoomOn = pOwnerNode.fZoomOn || this.fOpt.forceZoom;
			if(pOwnerNode.fZoom) pOwnerNode.fZoom.style.display = pOwnerNode.fZoomOn ? "" : "none";
			if(pOwnerNode.fOverlay) pOwnerNode.fOverlay.className = pOwnerNode.fZoomOn ? "resOverlay resOverlayZoom" : "resOverlay";

			if (pOwnerNode.fResFra){
				pOwnerNode.fResFra.style.width=Math.round(vSvg.fWidth)+"px";
				pOwnerNode.fResFra.style.height=Math.round(vSvg.fHeight)+"px";
			}
			vSvg.style.width=Math.round(vSvg.fWidth)+"px";
			vSvg.style.height=Math.round(vSvg.fHeight)+"px";
			scSiLib.fireResizedNode(vSvg);
		}catch(e){console.error("ERROR SizeBlkObj.onResizedAnc : "+e);}
	}
}
/** SizeBlkSvg.ruleSortKey */
scHPS.SizeBlkSvg.prototype.ruleSortKey = "A";
/** SizeBlkSvg.sOnClickZoom */
scHPS.SizeBlkSvg.sOnClickZoom = function(pEvent) {
	const vBlk = this.fBlk;
	if (!vBlk.fSldMgr || !vBlk.fSldMgr.fSldHdr) return false;
	const vSldHdr = vBlk.fSldMgr.fSldHdr;
	const vZmItm = vSldHdr.showZoom(vBlk.fSvg);
	const vCt = vSldHdr.getZoomContainer();
	const vResizer = {
		onResizedDes: function (pOwnerNode, pEvent) {
		},
		onResizedAnc: function (pOwnerNode, pEvent) {
			if (pEvent && pEvent.phase === 2) return;
			const vRate = vBlk.fSldMgr.getRatioNormalScreen() * vBlk.fZoomRatio;
			const vWantedW = vBlk.fSvg.oriW * vRate;
			const vWantedH = vBlk.fSvg.oriH * vRate;
			const vMaxW = vCt.offsetWidth;
			const vMaxH = vCt.offsetHeight;
			if (vWantedW > vMaxW || vWantedH > vMaxH) {
				const vRW = vWantedW / vMaxW;
				const vRH = vWantedH / vMaxH;
				if (vRW > vRH) {
					vZmItm.fWidth = vMaxW;
					vZmItm.fHeight = vWantedH / vRW;
				} else {
					vZmItm.fWidth = vWantedW / vRH;
					vZmItm.fHeight = vMaxH;
				}
			} else {
				vZmItm.fWidth = vWantedW;
				vZmItm.fHeight = vWantedH;
			}
			vZmItm.style.width = Math.round(vZmItm.fWidth) + "px";
			vZmItm.style.height = Math.round(vZmItm.fHeight) + "px";
			vZmItm.style.marginTop = Math.max(0, Math.round((vMaxH - vZmItm.fHeight) / 2)) + "px";
		}
	};
	scSiLib.addRule(vZmItm, vResizer);
	vResizer.onResizedAnc(vZmItm);
	return false;
}
// Call library init function...
scHPS.init();