
// Not working: 
// - Expert om ballongerna: "lorem ipsum"
// - Expert varnar: lorem ipsum
// - Analytiker: Lorem ipsum ok ok 

const shitListRegex = ["^Expert(.*?):", 
					   "^Analys(.*?):",
					   "^Analytiker(.*?):", 
					   "^Rykte(.*?):", 
					   "^Varningen(.*?):",
					   "^Strateg(.*?):", 
					   "^Statsvetare(.*?):", 
					   "^Ledare(.*?):", 
					   "^Källor(.*?):",
					   "^(.*?) oroa(r|d|de):",
					   "^(.*?) varn(ing|ar):"];

const shitEmoji = "💩";
const flyEmoji = "🪰";
const shitColor = "#9a580d";
let adsCounter = 0;
let infoboxCounter = 0;
let bannerCounter = 0;
let dynamicboxCounter = 0;
let shitTitles = new Set();

const isShit = (title) => {
	return shitListRegex.some(reg => title.match(reg));
}

// Bild från https://deepai.org/machine-learning-model/text2img
// Tagen från https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
const waitForElm = (selector) => {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
  
const dynamicCleanup = () => {

	waitForElm('.feed').then((feed) => {
		feed.querySelectorAll("h2").forEach(header => {
			if (isShit(header.innerHTML) && !(/\p{Extended_Pictographic}/u.test(header.innerHTML))){
				const newTitle =  shitEmoji + header.innerHTML + flyEmoji;
				header.innerHTML = newTitle;
				header.style.color = shitColor;
				shitTitles.add(header.innerHTML);
			}else{
				console.log("[-] "+header.innerHTML);
			}
		});

		feed.querySelectorAll('.component--dynamic_box_heading').forEach(dynamicbox => {
			dynamicbox.remove();
			dynamicboxCounter += 1;
		});

		feed.querySelectorAll('.group--sponsored').forEach(ad => {
			ad.remove();
			adsCounter += 1;
		});
	
		feed.querySelectorAll('.omnikey-informationbox').forEach(banner => {
			banner.remove();
			infoboxCounter += 1;
		});
	
		feed.querySelectorAll('.pre-banner').forEach(banner => {
			banner.remove();
			bannerCounter += 1;
		});
	});
	
	const totalAds = dynamicboxCounter + adsCounter + bannerCounter +infoboxCounter;
	browser.runtime.sendMessage({titles: shitTitles, ads:  totalAds});
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const totalAds = dynamicboxCounter + adsCounter + bannerCounter +infoboxCounter;
	sendResponse({ titles: shitTitles, ads:  totalAds});
});

waitForElm('#topPanorama').then((topPanorama) => {
	topPanorama.remove();
});

waitForElm('.pre-banner').then((_unused) => {
	document.querySelectorAll('.pre-banner').forEach(banner => {
		banner.remove();
		bannerCounter += 1;
	});
});

waitForElm('.feed').then((feed) => {
	
	const config = { attributes: true, childList: true, subtree: true };

	const callback = (mutationList, observer) => {
		for (const mutation of mutationList) {
				dynamicCleanup();
		}
	};

	const observer = new MutationObserver(callback);

	observer.observe(feed, config);
});

