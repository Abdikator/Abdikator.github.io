let currentSurah = null;
let currentAyah = null;

async function fetchVerseByTopic() {
    const topic = document.getElementById("topic").value.trim();

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

    const randomIndex = Math.floor(Math.random() * searchData.search.results.length);
    const result = searchData.search.results[randomIndex];
    const verseId = result.verse_id;

    const responseVerse = await fetch(`https://api.alquran.cloud/v1/ayah/${verseId}/editions/quran-simple,en.sahih`);
    const verseData = await responseVerse.json();

    let arabicText = verseData.data[0].text;
    const englishText = verseData.data[1].text;
    currentSurah = verseData.data[1].surah.number;
    currentAyah = verseData.data[1].numberInSurah;

    // Remove Bismillah if it's the first verse of a Surah (except Surah Al-Fatiha and Surah At-Tawbah)
    if (currentAyah === 1 && currentSurah !== 1 && currentSurah !== 9) {
        const bismillahRegex = /^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/;
        arabicText = arabicText.replace(bismillahRegex, '');
    }

    document.getElementById("verse").innerHTML = `${arabicText}<br>${englishText}`;
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