import fs from 'fs';

const API_URL = 'https://www.dnd5eapi.co/api/spells';

const ORDINALS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

// Tanpa ini semua level ditulis "1th/2th/3th Level".
function formatLevel(level) {
  return level === 0 ? 'Cantrip' : `${ORDINALS[level] ?? `${level}th`} Level`;
}

async function fetchAllSpells() {
  try {
    console.log('Mengambil daftar spell...');

    const response = await fetch(API_URL);
    const data = await response.json();

    const spellList = data.results;

    const detailedSpells = [];

    for (let i = 0; i < spellList.length; i++) {
      const spell = spellList[i];

      try {
        const detailResponse = await fetch(`https://www.dnd5eapi.co${spell.url}`);

        const detail = await detailResponse.json();

        const formattedSpell = {
          id: detail.index,
          name: detail.name,
          level: formatLevel(detail.level),

          school: detail.school ? detail.school.name : 'Unknown',

          class: detail.classes ? detail.classes.map((c) => c.name) : [],

          casting_time: detail.casting_time,

          range: detail.range,

          components: detail.components ? detail.components.join(', ') : '',

          duration: detail.duration,

          description: detail.desc ? detail.desc.join('\n') : 'No description.',
        };

        detailedSpells.push(formattedSpell);

        console.log(`Berhasil ${i + 1}/${spellList.length}: ${detail.name}`);
      } catch (err) {
        console.error(`Gagal spell ${spell.index}`, err);
      }
    }

    fs.writeFileSync('./src/data/spells-raw.json', JSON.stringify(detailedSpells, null, 2), 'utf-8');

    console.log('SELESAI! spells-raw.json dibuat.');
  } catch (err) {
    console.error(err);
  }
}

fetchAllSpells();
