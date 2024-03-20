let currentSurah = null;
let currentAyah = null;

// Sørensen-Dice coefficient for string similarity
function diceCoefficient(string1, string2) {
    if (string1 === string2) return 1;
    if (string1.length < 2 || string2.length < 2) return 0;

    let matches = 0;
    const bigrams1 = new Map();

    for (let i = 0; i < string1.length - 1; i++) {
        const bigram = string1.substr(i, 2);
        const count = bigrams1.has(bigram) ? bigrams1.get(bigram) + 1 : 1;

        bigrams1.set(bigram, count);
    }

    for (let i = 0; i < string2.length - 1; i++) {
        const bigram = string2.substr(i, 2);
        const count = bigrams1.has(bigram) ? bigrams1.get(bigram) : 0;

        if (count > 0) {
            bigrams1.set(bigram, count - 1);
            matches++;
        }
    }

    return (2.0 * matches) / (string1.length + string2.length - 2);
}

async function fetchVerseByTopic() {
    const topic = document.getElementById("topic").value.trim().toLowerCase();

    if (topic === "") {
        alert("Please enter a topic.");
        return;
    }

    const response = await fetch(`https://api.quran.com/api/v4/search?q=${topic}&size=100&page=1`);
    const searchData = await response.json();

    if (searchData.search.total_results === 0) {
        alert("No verses found for this topic.");
        return;
    }

    const results = searchData.search.results;
    const selectedResults = [];
    const similarityThreshold = 0.3; // Adjust based on desired leniency

    for (const result of results) {
        const verseText = result.text || ""; // Assuming 'text' contains the verse text
        if (diceCoefficient(topic, verseText.toLowerCase()) >= similarityThreshold) {
            selectedResults.push(result);
            if (selectedResults.length >= 20) break;
        }
    }

    if (selectedResults.length === 0) {
        alert("No verses closely matched the topic.");
        return;
    }

    // Continue with displaying the results as per your existing code...
    const fetchedVersesContainer = document.getElementById('fetched-verses');
    fetchedVersesContainer.innerHTML = '';

    for (const result of selectedResults) {
        // Your existing code for fetching and displaying verses goes here...
    }

    document.body.classList.add('content-moved-up');
}



async function revealSurah() {
    if (!currentSurah) {
        alert("Please fetch a verse by topic first.");
        return;
    }

    const responseSurah = await fetch(`https://api.alquran.cloud/v1/surah/${currentSurah}/editions/quran-simple,en.sahih`);
    const surahData = await responseSurah.json();

    let surahContent = '';

    surahData.data[1].ayahs.forEach((ayah, index) => {
        const ayahNumber = ayah.numberInSurah;
        const ayahText = ayah.text;
        const highlighted = ayahNumber === currentAyah ? 'highlighted' : '';

        let ayahTextArabic = surahData.data[0].ayahs[index].text;
        if (index === 0 && currentSurah !== 1 && currentSurah !== 9) {
            ayahTextArabic = ayahTextArabic.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
        }
        surahContent += `<div class="verse-container"><p class="${highlighted} english-text">${ayahNumber}. ${ayahText}</p><p class="${highlighted} arabic-text">${ayahTextArabic}</p></div>`;
    });

    if (currentSurah !== 1 && currentSurah !== 9) {
        surahContent = `<div class="verse-container"><p class="english-text">0. In the name of Allah, the Entirely Merciful, the Especially Merciful.</p><p class="arabic-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p></div>${surahContent}`;
    }

    document.getElementById('surahContainer').innerHTML = surahContent;

    document.querySelector('.surahs').style.display = 'flex';

    const highlightedElement = document.querySelector('.highlighted');
    const surahContainer = document.getElementById('surahContainer');

    const contentHeight = surahContainer.scrollHeight;
    const containerHeight = surahContainer.offsetHeight;
    const elementOffsetTop = highlightedElement.offsetTop;
    const elementHeight = highlightedElement.offsetHeight;

    const scrollTopValue = Math.min(elementOffsetTop - (containerHeight - elementHeight) / 2, contentHeight - containerHeight);
    surahContainer.scrollTop = scrollTopValue;
}
function autoResize(element) {
    element.style.height = 'auto'; // Reset the height to auto
    element.style.height = element.scrollHeight + 'px'; // Set the new height based on the scroll height
}

async function revealSurahByIndex(surahNumber, ayahNumber) {
    const responseSurah = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,en.sahih`
    );
    const surahData = await responseSurah.json();

    let surahContent = '';

    surahData.data[1].ayahs.forEach((ayah, index) => {
        const ayahNumberInSurah = ayah.numberInSurah;
        const ayahText = ayah.text;
        const highlighted = ayahNumberInSurah === ayahNumber ? 'highlighted' : '';

        let ayahTextArabic = surahData.data[0].ayahs[index].text;
        if (index === 0 && surahNumber !== 1 && surahNumber !== 9) {
            ayahTextArabic = ayahTextArabic.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
        }
        surahContent += `<div class="verse-container"><p class="${highlighted} english-text">${ayahNumberInSurah}. ${ayahText}</p><p class="${highlighted} arabic-text">${ayahTextArabic}</p></div>`;
    });

    if (surahNumber !== 1 && surahNumber !== 9) {
        surahContent = `<div class="verse-container"><p class="english-text">0. In the name of Allah, the Entirely Merciful, the Especially Merciful.</p><p class="arabic-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p></div>${surahContent}`;
    }

    document.getElementById('surahContainer').innerHTML = surahContent;

    document.querySelector('.surahs').style.display = 'flex';

    const highlightedElement = document.querySelector('.highlighted');
    const surahContainer = document.getElementById('surahContainer');

    const contentHeight = surahContainer.scrollHeight;
    const containerHeight = surahContainer.offsetHeight;
    const elementOffsetTop = highlightedElement.offsetTop;
    const elementHeight = highlightedElement.offsetHeight;

    const scrollTopValue = Math.min(elementOffsetTop - (containerHeight - elementHeight) / 2, contentHeight - containerHeight);
    surahContainer.scrollTop = scrollTopValue;
}