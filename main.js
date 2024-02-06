const input = document.querySelector("input");
const button = document.querySelector("button");
const mainEl = document.querySelector("main");

button.addEventListener("click", async () => {
  const word = input.value?.trim();

  if (!word)
    return alert("Please enter a word");

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  const res = await fetch(url);
  const data = await res?.json();

  if (!res.ok || !data?.[0]) displayError();
  else displayResult(data[0]);
});

function displayError() {
  const errorEl = document.createElement("section");

  errorEl.innerHTML =
    `<h2>No Definitions Found</h2>
    <p>Sorry pal, we could not find definitions for the word you were looking for.</p>`;

  errorEl.style.color = "red";
  mainEl.appendChild(errorEl);
}

function displayResult(data) {
  const { word, phonetics, meanings } = data;
  mainEl.innerHTML = `<h2>${word}</h2>`;
  displayPhonetics(phonetics);
  displayMeanings(meanings);
}

// phonetics 
function displayPhonetics(phonetics) {
  const container = document.createElement("section");

  phonetics.forEach(phonetic => {
    const phoneticEl = document.createElement("article");

    phoneticEl.innerHTML =
      `${phonetic.text ? `<p><b>Text</b>: ${phonetic.text}</p>` : ""}
      ${phonetic.audio ?
      `<audio controls>
        <source src="${phonetic.audio}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>` : ""}`;

    container.appendChild(phoneticEl);
  });

  mainEl.appendChild(container);
}

// meanings 
function displayMeanings(meanings) {
  const container = document.createElement("section");

  meanings.forEach(meaning => {
    const meaningEl = document.createElement("article");

    meaningEl.innerHTML = `
      <h3>Part of Speech: <span>${meaning.partOfSpeech}</span></h3>
      ${meaning.synonyms?.length > 0 ? 
        `<p><b>Synonyms</b>: ${meaning.synonyms.join(", ")}</p>` : ""}
      ${meaning.antonyms?.length > 0 ? 
        `<p><b>Antonyms</b>: ${meaning.antonyms.join(", ")}</p>` : ""}
      ${meaning.definitions?.length > 0 ?
        `<strong>Definitions</strong>
        <ul>
          ${meaning.definitions.map(definition => `
            <li>
              <p>${definition.definition}</p>
              ${definition.example ? `<p><b>Example</b>: ${definition.example}</p>` : ""}
            </li>
          `).join("")}
        </ul>` : ""}
      `;

    container.appendChild(meaningEl);
  });

  mainEl.appendChild(container);
}