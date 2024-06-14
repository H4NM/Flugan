
// Not working: 
// - Expert om ballongerna: "lorem ipsum"
// - Expert varnar: lorem ipsum
// - Analytiker: Lorem ipsum ok ok 

const shitListRegex = ["^Expert(.*?):", 
					   "^Analys(.*?):",
					   "^Analytiker(.*?):", 
					   "^Rykte(.*?):", 
					   "^Varning(.*?):",
					   "^Strateg(.*?):", 
					   "^Statsvetare(.*?):", 
					   "^Ledare(.*?):", 
					   "^Källor(.*?):",
					   "^(.*?) oroa(r|d|de):",
					   "^(.*?) varn(ing|ar):"];

const htmlRegex = "\<\/"

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
			
			//Om titeln innehåller HTML karaktärerna \<
			if (header.innerHTML.match(htmlRegex)){
				return
			}

			//Om titeln matchar mot skit regex och inte redan har en emoji i sig
			if (isShit(header.innerHTML) && !(/\p{Extended_Pictographic}/u.test(header.innerHTML))){
				const newTitle =  shitEmoji + header.innerHTML + flyEmoji;
				header.innerHTML = newTitle;
				header.style.color = shitColor;

				//Gör om titeln till vad det är
				shitTitles.add(header.innerHTML);

				//Lägger till rating Div
				const ratingDiv = document.createElement("div");
				ratingDiv.style.background = "red";
				ratingDiv.innerHTML = shitEmoji;
				ratingDiv.id = "ratingDiv";

				//Lägger till tumme upp knapp
				const thumbUpButton = document.createElement("button");
				thumbUpButton.style.background = "green";
				thumbUpButton.innerHTML = "Upp";

				//Lägger till tumme ner knapp
				const thumbDownButton = document.createElement("button");
				thumbDownButton.style.background = "blue";
				thumbDownButton.innerHTML = "Ner";

				ratingDiv.append(thumbUpButton);
				ratingDiv.append(thumbDownButton);

				header.insertAdjacentElement('afterend', ratingDiv);

				
				
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

