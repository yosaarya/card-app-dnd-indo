import fs from 'fs';

const API_URL = 'https://www.dnd5eapi.co/api/spells';

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

        const detailResponse = await fetch(
          `https://www.dnd5eapi.co${spell.url}`
        );

        const detail = await detailResponse.json();

        const formattedSpell = {
          id: detail.index,
          name: detail.name,
          level: detail.level === 0
            ? 'Cantrip'
            : `${detail.level}th Level`,

          school: detail.school
            ? detail.school.name
            : 'Unknown',

          class: detail.classes
            ? detail.classes.map(c => c.name)
            : [],

          casting_time: detail.casting_time,

          range: detail.range,

          components: detail.components
            ? detail.components.join(', ')
            : '',

          duration: detail.duration,

          description: detail.desc
            ? detail.desc.join('\n')
            : 'No description.'
        };

        detailedSpells.push(formattedSpell);

        console.log(
          `Berhasil ${i + 1}/${spellList.length}: ${detail.name}`
        );

      } catch (err) {

        console.error(
          `Gagal spell ${spell.index}`,
          err
        );
      }
    }

    fs.writeFileSync(
      './src/data/spells-raw.json',
      JSON.stringify(detailedSpells, null, 2),
      'utf-8'
    );

    console.log('SELESAI! spells-raw.json dibuat.');

  } catch (err) {

    console.error(err);
  }
}

fetchAllSpells();