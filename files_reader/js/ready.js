function disableStyles(doc, disable) {
	for ( var i=0; i<doc.styleSheets.length; i++) {
		void(doc.styleSheets.item(i).disabled=disable);
	}
}

function addStyleSheet() {
	var style = document.createElement("style");
	// WebKit hack :(
	style.appendChild(document.createTextNode(""));
	document.head.appendChild(style);
	return style.sheet;
}

function getCSSRule(sheet, selector, del) {
        lcSelector = selector.toLowerCase();
        for  ( var i=0; i<sheet.cssRules.length; i++) {
		if (sheet.cssRules.item(i).selectorText.toLowerCase() == lcSelector) {
			if (del) {
				sheet.deleteRule(i);
				return null;
			} else {
				return sheet.cssRules.item(i);
			}
		}
	}
	return null;
}

function addCSSRule(sheet, selector, rules, index) {
	if("insertRule" in sheet) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else if("addRule" in sheet) {
		sheet.addRule(selector, rules, index);
	}
}

function delCSSRule(sheet, selector) {
	getCSSRule(sheet, selector, true);
}

document.onreadystatechange = function () {  
	if (document.readyState == "complete") {
		// only enable close button when launched in an iframe
		if (parent !== window) {
			$('#close').show();
			$('#close').on('click', function() { reader.book.destroy(); parent.OCA.FilesReader.Plugin.hide(); });
		}

		// some parameters... 
		EPUBJS.filePath = "js/libs/";
		EPUBJS.cssPath = "css/";

		// touch-enabled devices...
		$('#touch_nav').prop('checked', !('ontouchstart' in document.documentElement));
		if (!($('#touch_nav').prop('checked'))) {
			$("#next").addClass("touch_nav");
			$("#prev").addClass("touch_nav");
		}

		// idevices...
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', document.getElementsByTagName("base").item(0).href + 'css/idevice.css'));
		}

		function nightModeConfig() {
			delCSSRule(EPUBJS.nightSheet, EPUBJS.nightSelector);
			addCSSRule(EPUBJS.nightSheet, EPUBJS.nightSelector, 'color: ' + EPUBJS.nightModeColor +  ' !important; background: ' + EPUBJS.nightModeBackground + ' !important;');
		}

		// nightMode
		EPUBJS.nightMode = false;
		EPUBJS.nightSheet = addStyleSheet();
		EPUBJS.nightSelector = '.night *';
		EPUBJS.nightModeBackground = $('#nightModeBackground').val();
		EPUBJS.nightModeColor = $('#nightModeColor').val();
		addCSSRule(EPUBJS.nightSheet, '.nonight', 'background: initial !important;');
		nightModeConfig();

		$('#nightModeBackground').on('change', function() {
			EPUBJS.nightModeBackground = $('#nightModeBackground').val();
			nightModeConfig();
		});

		$('#nightModeColor').on('change', function() {
			EPUBJS.nightModeColor = $('#nightModeColor').val();
			nightModeConfig();
		});

		var reader = ePubReader(document.getElementById("dllink").value,  { contained: true });

		// enable night/day mode switch by clicking on the book title/author
		// just switching in the "night" class works on some browsers but not on others, hence the trickery with
		// setStyle/removeStyle...
		$('#metainfo').on('click', function() {
			if(EPUBJS.nightMode) {
				reader.book.removeStyle("background");
				reader.book.removeStyle("color");
				$("#outerContainer").removeClass("night");
				EPUBJS.nightMode = false;
			} else {
				reader.book.setStyle("background", EPUBJS.nightModeBackground);
				reader.book.setStyle("color", EPUBJS.nightModeColor);
				$("#outerContainer").addClass("night");
				EPUBJS.nightMode = true;
			}
		});

		// extra-wide page turn area?
		$('#touch_nav').on('click', function() {
			if ($('#touch_nav').prop('checked')) {
				$("#prev").removeClass("touch_nav");
				$("#next").removeClass("touch_nav");
			} else {
				$("#prev").addClass("touch_nav");
				$("#next").addClass("touch_nav");
			}
		});
			
		// user-defined font
		EPUBJS.ignore_css = false;
		EPUBJS.bookFrame = null;
		EPUBJS.user_fontFamily = $('#fontFamily').val();
		EPUBJS.user_fontSize = $('#fontSize').val() + '%';

		$('#ignore_css').on('click', function() {
			EPUBJS.bookFrame = document.getElementsByTagName('iframe')[0].contentDocument;
			if ($('#ignore_css').prop('checked')) {
				$('#fontFamily').prop('disabled',false);
				$('#fontSize').prop('disabled',false);
				EPUBJS.ignore_css = true;
				reader.book.setStyle('font-size', EPUBJS.user_fontSize);
				reader.book.setStyle('font-family', EPUBJS.user_fontFamily);
			} else {
				$('#fontFamily').prop('disabled',true);
				$('#fontSize').prop('disabled',true);
				EPUBJS.ignore_css = false;
				reader.book.removeStyle('font-size');
				reader.book.removeStyle('font-family');
			}
			disableStyles(EPUBJS.bookFrame, EPUBJS.ignore_css);
;
		});

		$('#fontSize').on('change', function() {
			EPUBJS.user_fontSize = $('#fontSize').val() + '%';
			$('#font_example').css('font-size', EPUBJS.user_fontSize);
			reader.book.setStyle('font-size', EPUBJS.user_fontSize);
		});
		$('#fontFamily').on('change', function() {
			EPUBJS.user_fontFamily = $('#fontFamily').val();
			$('#font_example').css('font-family', EPUBJS.user_fontFamily);
			reader.book.setStyle('font-family', EPUBJS.user_fontFamily);
		});
	}
};

