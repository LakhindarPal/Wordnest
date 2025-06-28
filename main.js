document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const wordDisplay = document.getElementById('word-display');
  const fontSelect = document.getElementById('font-select');
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  
  const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = (savedTheme === 'dark');
  } else {
    htmlElement.setAttribute('data-theme', 'light');
  }
  
  themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
  
  const savedFont = localStorage.getItem('font');
  if (savedFont) {
    document.body.setAttribute('data-font', savedFont);
    fontSelect.value = savedFont;
  } else {
    document.body.setAttribute('data-font', 'sans-serif');
  }
  
  fontSelect.addEventListener('change', (event) => {
    const selectedFont = event.target.value;
    document.body.setAttribute('data-font', selectedFont);
    localStorage.setItem('font', selectedFont);
  });
  
  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const word = searchInput.value.trim();
    
    try {
      wordDisplay.innerHTML = `
        <div class="loading-gif">
          <img src="/assets/loader.gif" alt="Loading gif" />
        </div>
      `;
      const response = await fetch(`${API_URL}${word}`);
      const data = await response.json();
      
      if (response.ok && data.length > 0) {
        renderWordDefinition(data[0]);
      } else {
        renderNotFound();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      renderNotFound();
    }
  });
  
  function renderWordDefinition(data) {
    let phoneticText = '';
    let audioSrc = '';
    
    if (data.phonetics && data.phonetics.length > 0) {
      const phoneticWithText = data.phonetics.find(p => p.text);
      if (phoneticWithText) {
        phoneticText = phoneticWithText.text;
      }
      const phoneticWithAudio = data.phonetics.find(p => p.audio);
      if (phoneticWithAudio) {
        audioSrc = phoneticWithAudio.audio;
      }
    }
    
    let html = `
            <div class="word-header">
                <div class="word-info">
                    <h1>${data.word}</h1>
                    ${phoneticText ? `<p class="phonetic">${phoneticText}</p>` : ''}
                </div>
                ${audioSrc ? `<button class="play-audio-button" aria-label="Play audio" data-audio="${audioSrc}">
                    <img src="assets/icon-play.svg" alt="Play icon">
                </button>` : ''}
            </div>
        `;
    
    data.meanings.forEach(meaning => {
      html += `
                <div class="meaning-section">
                    <h2>${meaning.partOfSpeech}</h2>
                    <p class="meaning-title">Meaning</p>
                    <ul class="meaning-list">
            `;
      meaning.definitions.forEach(definition => {
        html += `
                    <li>
                        ${definition.definition}
                        ${definition.example ? `<p class="example">"${definition.example}"</p>` : ''}
                    </li>
                `;
      });
      html += `</ul>`;
      
      if (meaning.synonyms && meaning.synonyms.length > 0) {
        html += `
                    <div class="synonyms">
                        <span>Synonyms</span>
                        ${meaning.synonyms.map(syn => `<a href="#" class="synonym-link">${syn}</a>`).join('')}
                    </div>
                `;
      }
      html += `</div>`;
    });
    
    if (data.sourceUrls && data.sourceUrls.length > 0) {
      html += `
                <div class="source-section">
                    <span>Source</span>
                    <a href="${data.sourceUrls[0]}" target="_blank" rel="noopener noreferrer">
                        ${data.sourceUrls[0]}
                        <img src="assets/icon-ex-link.svg" alt="External Link Icon">
                    </a>
                </div>
            `;
    }
    
    wordDisplay.innerHTML = html;
    
    const playButton = wordDisplay.querySelector('.play-audio-button');
    if (playButton) {
      playButton.addEventListener('click', () => {
        const audio = new Audio(playButton.dataset.audio);
        audio.play().catch(e => console.error("Audio playback failed:", e));
      });
    }
    
    wordDisplay.querySelectorAll('.synonym-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = link.textContent;
        searchForm.dispatchEvent(new Event('submit'));
      });
    });
  }
  
  function renderNotFound() {
    wordDisplay.innerHTML = `
            <div class="not-found">
                <img src="assets/icon-sad.svg" alt="Sad emoji">
                <h2>No Definitions Found</h2>
                <p>Sorry pal, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.</p>
            </div>
        `;
  }
});