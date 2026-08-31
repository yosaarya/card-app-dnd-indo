import React, { useState } from 'react';
import { RotateCw, Image as ImageIcon, Plus } from 'lucide-react';

export default function SpellCard({
  spell,
  isSelected,
  onToggleSelect,
  onAdd
}) {

  const [isFlipped, setIsFlipped] = useState(false);

  const [cardImage, setCardImage] = useState(
    spell.customArt || null
  );

  const [isDragging, setIsDragging] = useState(false);

  const [editableName, setEditableName] = useState(
    spell.name
  );

  const [editableDesc, setEditableDesc] = useState(
    spell.card_data?.summary || ''
  );

  const getSchoolStyles = (school) => {

    const styles = {

      Abjuration: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        text: 'text-blue-900',
        border: 'border-blue-300'
      },

      Conjuration: {
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        text: 'text-orange-900',
        border: 'border-orange-300'
      },

      Divination: {
        badge: 'bg-sky-50 text-sky-700 border-sky-200',
        text: 'text-sky-900',
        border: 'border-sky-300'
      },

      Enchantment: {
        badge: 'bg-pink-50 text-pink-700 border-pink-200',
        text: 'text-pink-900',
        border: 'border-pink-300'
      },

      Evocation: {
        badge: 'bg-red-50 text-red-700 border-red-200',
        text: 'text-red-900',
        border: 'border-red-300'
      },

      Illusion: {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        text: 'text-purple-900',
        border: 'border-purple-300'
      },

      Necromancy: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-900',
        border: 'border-emerald-300'
      },

      Transmutation: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'text-amber-900',
        border: 'border-amber-300'
      }
    };

    return styles[school] || {
      badge: 'bg-slate-50 text-slate-700 border-slate-200',
      text: 'text-slate-900',
      border: 'border-slate-300'
    };
  };

  const currentStyle =
    getSchoolStyles(spell.school);

  // =========================
  // IMAGE COMPRESSION
  // =========================

  const compressImage = (file) => {

    return new Promise((resolve) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (event) => {

        const img = new Image();

        img.src = event.target.result;

        img.onload = () => {

          const canvas =
            document.createElement('canvas');

          const MAX_WIDTH = 600;

          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {

            const scale =
              MAX_WIDTH / width;

            width = MAX_WIDTH;
            height = height * scale;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx =
            canvas.getContext('2d');

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressed =
            canvas.toDataURL(
              'image/jpeg',
              0.75
            );

          resolve(compressed);
        };
      };
    });
  };

  // =========================
  // PROCESS FILE
  // =========================

  const processFile = async (file) => {

    if (!file) return;

    if (!file.type.startsWith('image/')) {

      alert('File harus berupa gambar!');
      return;
    }

    try {

      const compressedImage =
        await compressImage(file);

      setCardImage(compressedImage);

    } catch (err) {

      console.error(err);

      alert('Gagal memproses gambar.');
    }
  };

  // =========================
  // FILE INPUT
  // =========================

  const handleImageUpload = (e) => {

    const file = e.target.files[0];

    processFile(file);
  };

  // =========================
  // DRAG EVENTS
  // =========================

  const handleDragOver = (e) => {

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (e) => {

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (e) => {

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const file =
      e.dataTransfer.files[0];

    processFile(file);
  };

  return (

    <div className="flex flex-col bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-700 w-[69mm] items-center gap-2">

      {/* TOP CONTROL */}

      <div className="flex justify-between items-center w-full px-0.5">

        <button
          type="button"

          onClick={() =>
            onAdd({
              ...spell,
              name: editableName,
              description: editableDesc,
              customArt: cardImage
            })
          }

          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors"
        >
          <Plus size={12} />
          Add to Grid
        </button>

        <button
          type="button"

          onClick={() =>
            setIsFlipped(!isFlipped)
          }

          className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[9px] font-medium px-2"
        >
          <RotateCw size={10} />

          {isFlipped
            ? 'Lihat Depan'
            : 'Lihat Belakang'}
        </button>

      </div>

      {/* CARD BODY */}

      <div

        onClick={() =>
          onToggleSelect &&
          onToggleSelect(spell.id)
        }

        className={`relative w-[63mm] h-[88mm] bg-white rounded-lg p-3 flex flex-col justify-between cursor-pointer select-none border-2 transition-all duration-200 ${
          isSelected
            ? 'border-purple-600 ring-4 ring-purple-100 shadow-xl'
            : `hover:border-purple-400 ${currentStyle.border}`
        }`}
      >

        {/* SELECTED */}

        {isSelected && (

          <div className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">
            ✓
          </div>
        )}

        {/* FRONT */}

        <div className={`flex flex-col h-full justify-between ${
          isFlipped ? 'hidden' : 'flex'
        }`}>

          <div>

            <div className="flex items-start justify-between border-b border-slate-100 pb-1">

              <input
                value={editableName}

                onClick={(e) =>
                  e.stopPropagation()
                }

                onChange={(e) =>
                  setEditableName(
                    e.target.value
                  )
                }

                className={`font-bold text-[11px] uppercase tracking-wide leading-tight ${currentStyle.text} bg-transparent focus:outline-none w-[68%] truncate`}
              />

              <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full border ${currentStyle.badge} truncate max-w-[32%]`}>
                {spell.school}
              </span>

            </div>

            <p className="text-[8px] text-slate-400 italic mt-1 px-0.5">
              {spell.level} • {spell.class.join(', ')}
            </p>

          </div>

          {/* IMAGE AREA */}

          <div

            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}

            className={`w-full flex-1 my-2 rounded border-2 overflow-hidden relative flex items-center justify-center group min-h-[120px] transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                : 'border-dashed border-slate-200 bg-slate-50'
            }`}

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {cardImage ? (

              <div className="w-full h-full relative">

                <img
                  src={cardImage}
                  alt="Spell Art"
                  className="w-full h-full object-cover block"
                />

                {isDragging && (

                  <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center text-purple-700 font-bold text-[10px]">
                    Drop Image Here
                  </div>
                )}

                <label className="absolute bottom-1 right-1 p-1 bg-black/65 text-white rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">

                  <ImageIcon size={10} />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                </label>

              </div>

            ) : (

              <label className="flex flex-col items-center justify-center cursor-pointer text-slate-300 hover:text-purple-500 w-full h-full transition-colors p-4 text-center">

                <ImageIcon
                  size={22}
                  className={
                    isDragging
                      ? 'text-purple-500 scale-110'
                      : ''
                  }
                />

                <span className="text-[8px] mt-1 font-medium">

                  {isDragging
                    ? 'Lepaskan Gambar!'
                    : 'Drop atau Klik untuk Upload Art'}

                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

              </label>
            )}

          </div>

        </div>

        {/* BACK */}

        <div className={`flex flex-col h-full justify-between ${
          isFlipped ? 'flex' : 'hidden'
        }`}>

          <div>

            <h3 className={`font-bold ${currentStyle.text} border-b border-slate-100 pb-1 text-[10px] uppercase tracking-wide`}>
              {editableName}
            </h3>

            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 bg-slate-50 p-1.5 rounded-md border border-slate-150 text-[7.5px] text-slate-700 my-1.5">

              <div>
                <span className="text-slate-400 block text-[6.5px] uppercase font-bold">
                  Cast
                </span>

                <span className="font-medium truncate block">
                  {spell.casting_time}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[6.5px] uppercase font-bold">
                  Jarak
                </span>

                <span className="font-medium truncate block">
                  {spell.range}
                </span>
              </div>

              <div className="col-span-2 border-t border-slate-200/60 pt-0.5 mt-0.5">

                <span className="text-slate-400 block text-[6.5px] uppercase font-bold">
                  Durasi
                </span>

                <span className="font-medium block truncate">
                  {spell.duration}
                </span>

              </div>

            </div>

          </div>

          <div className="text-[7.5px] text-slate-600 leading-relaxed border-t border-dashed border-slate-200 pt-1.5 flex-1 overflow-hidden">

            <textarea
              value={editableDesc}

              onChange={(e) =>
                setEditableDesc(
                  e.target.value
                )
              }

              className="w-full h-full resize-none text-justify bg-transparent focus:outline-none hover:bg-slate-50 p-0.5 rounded text-[7.5px]"

              placeholder="Tulis deskripsi mantra di sini..."
            />

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-100 mt-1"></div>

      </div>

    </div>
  );
}