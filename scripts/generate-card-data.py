import json
import re

INPUT_FILE = '../src/data/spells-raw.json'
OUTPUT_FILE = '../src/data/spells-card.json'


def extract_damage(desc):

    matches = re.findall(
        r'(\d+d\d+)\s+(\w+)\s+damage',
        desc.lower()
    )

    return [
        f'{dice} {dtype.title()}'
        for dice, dtype in matches
    ]


def extract_healing(desc):

    matches = re.findall(
        r'regain hit points equal to (\d+d\d+)',
        desc.lower()
    )

    return matches


def extract_save(desc):

    match = re.search(
        r'(strength|dexterity|constitution|intelligence|wisdom|charisma) saving throw',
        desc.lower()
    )

    if not match:
        return None

    mapping = {
        'strength': 'STR',
        'dexterity': 'DEX',
        'constitution': 'CON',
        'intelligence': 'INT',
        'wisdom': 'WIS',
        'charisma': 'CHA'
    }

    return mapping.get(match.group(1))


def extract_aoe(desc):

    desc = desc.lower()

    patterns = [

        (r'(\d+)[-\s]?foot[-\s]?radius', 'Radius'),

        (r'(\d+)[-\s]?foot cone', 'Cone'),

        (r'(\d+)[-\s]?foot line', 'Line'),

        (r'(\d+)[-\s]?foot cube', 'Cube'),

        (r'(\d+)[-\s]?foot sphere', 'Sphere')
    ]

    for pattern, shape in patterns:

        match = re.search(pattern, desc)

        if match:

            return f'{match.group(1)} ft {shape}'

    return None


def detect_combat_type(desc):

    desc = desc.lower()

    if 'spell attack' in desc:
        return 'ATTACK'

    if 'saving throw' in desc:
        return 'SAVE'

    if 'regain hit points' in desc:
        return 'HEAL'

    if 'summon' in desc:
        return 'SUMMON'

    return 'UTILITY'


def build_summary(spell, desc):
    school = spell.get('school', '').lower()
    desc = desc.lower()
    name = spell.get('name', '').lower()

    # 1. OVERRIDE SPESIFIK 
    # Gunakan ini untuk spell yang fungsinya terlalu unik untuk ditangkap keyword
    custom_summaries = {
        'guidance': 'Memberikan bonus +1d4 pada satu ability check.',
        'bless': 'Memberikan bonus +1d4 pada attack roll dan saving throw.',
        'bane': 'Target mendapat penalti -1d4 pada attack roll dan saving throw.',
        'shield': 'Memberikan +5 AC hingga giliranmu berikutnya.',
        'mage hand': 'Menciptakan tangan gaib untuk memanipulasi objek.',
        'true strike': 'Memberikan advantage pada serangan berikutnya.'
    }
    
    if name in custom_summaries:
        return custom_summaries[name]

    # 2. DETEKSI BERDASARKAN KEYWORD DESKRIPSI (Urutan menentukan prioritas)
    if 'regain hit points' in desc:
        return 'Memulihkan HP target.'
    if 'temporary hit points' in desc:
        return 'Memberikan Temporary Hit Points (THP).'
    if 'spell attack' in desc:
        return 'Serangan sihir langsung.'
    if 'saving throw' in desc and 'damage' in desc:
        return 'Target melakukan saving throw untuk menghindari damage.'
    if 'saving throw' in desc:
        return 'Target harus melakukan saving throw terhadap efek sihir.'
    if 'ability check' in desc:
        return 'Mempengaruhi hasil ability check target.'
    if 'advantage on' in desc:
        return 'Memberikan advantage pada roll tertentu.'
    if 'disadvantage on' in desc:
        return 'Memberikan disadvantage pada roll target.'

    # 3. FALLBACK BERDASARKAN SCHOOL OF MAGIC (Jika semua di atas gagal)
    summaries = {
        'evocation': 'Ledakan energi sihir.',
        'illusion': 'Menciptakan efek ilusi visual atau suara.',
        'necromancy': 'Manipulasi energi kehidupan & kematian.',
        'abjuration': 'Perlindungan gaib atau penangkal sihir.',
        'conjuration': 'Memanggil entitas atau memindahkan objek.',
        'transmutation': 'Mengubah sifat fisik benda atau makhluk.',
        'enchantment': 'Mempengaruhi pikiran dan perilaku target.',
        'divination': 'Mengungkap informasi gaib atau masa depan.'
    }

    return summaries.get(school, 'Efek sihir unik.')

def simplify_spell(spell):

    desc = spell.get(
        'description',
        ''
    )

    duration = spell.get(
        'duration',
        ''
    )

    components = spell.get(
        'components',
        ''
    )

    damage = extract_damage(desc)

    healing = extract_healing(desc)

    save_type = extract_save(desc)

    aoe = extract_aoe(desc)

    attack_roll = (
        'spell attack'
        in desc.lower()
    )

    half_damage = (
        'half as much damage'
        in desc.lower()
    )

    concentration = (
        'concentration'
        in duration.lower()
    )

    ritual = spell.get(
        'ritual',
        False
    )

    material_cost = (
        'gp'
        in str(components).lower()
    )

    combat_type = detect_combat_type(desc)

    summary = build_summary(
        spell,
        desc
    )

    effects = []

    if attack_roll:
        effects.append(
            'Spell Attack Roll'
        )

    if save_type:
        effects.append(
            f'{save_type} Save'
        )

    if half_damage:
        effects.append(
            'Half Damage on Success'
        )

    if concentration:
        effects.append(
            'Concentration'
        )

    if ritual:
        effects.append(
            'Ritual'
        )

    if material_cost:
        effects.append(
            'Material Cost'
        )
        
    if 'ability check' in desc.lower():
        effects.append('Affects Ability Checks')
        
    if 'advantage' in desc.lower():
        effects.append('Grants Advantage/Disadvantage')

    card_data = {

        'summary': summary,

        'combat_type': combat_type,

        'damage': damage,

        'healing': healing,

        'save': save_type,

        'attack_roll': attack_roll,

        'half_damage': half_damage,

        'concentration': concentration,

        'ritual': ritual,

        'material_cost': material_cost,

        'aoe': aoe,

        'effects': effects
    }

    return card_data


with open(
    INPUT_FILE,
    'r',
    encoding='utf-8'
) as f:

    spells = json.load(f)


processed = []

for spell in spells:

    new_spell = {
        **spell,
        'card_data': simplify_spell(spell)
    }

    processed.append(new_spell)


with open(
    OUTPUT_FILE,
    'w',
    encoding='utf-8'
) as f:

    json.dump(
        processed,
        f,
        indent=2,
        ensure_ascii=False
    )

print(
    'SELESAI! spells-card.json berhasil dibuat.'
)