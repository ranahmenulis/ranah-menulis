/**
 * Static help content (STD-11). No model is called. Prompts come from the design board
 * (docs/desain/aplikasi/Main.dc.html).
 * [konfirmasi] The starter lines under each kit are placeholder editorial text; the client or
 * editors own the final content of the inspiration kit.
 */

import type { Locale } from "@/lib/i18n/config";

export const prompts = [
  "Tulis satu adegan ketika tokohmu menunggu sesuatu yang tidak pernah ia sebut namanya.",
  "Ceritakan sebuah rumah lewat satu bau yang masih tertinggal di dalamnya.",
  "Buka dengan kalimat yang diucapkan seseorang di dapur. Jangan jelaskan siapa dia sampai paragraf ketiga.",
  "Tulis surat untuk orang yang sudah pindah rumah, tanpa sekali pun memakai kata rindu.",
  "Pilih satu benda di mejamu dan tulis riwayatnya dari sudut pandang benda itu.",
];

export type Kit = { name: string; hint: string; entries: string[] };

export const kits: Kit[] = [
  {
    name: "Ide cerita",
    hint: "Premis singkat",
    entries: [
      "Seorang penjahit menemukan catatan ukuran tubuh milik orang yang tak pernah datang mengambil pesanannya.",
      "Dua saudara berbagi satu rumah warisan, tetapi hanya satu yang tahu ada ruangan terkunci di dalamnya.",
      "Pasar subuh di kota kecil punya aturan yang tak tertulis, dan seorang pendatang melanggarnya pada hari pertama.",
    ],
  },
  {
    name: "Kalimat pembuka",
    hint: "Untuk paragraf pertama",
    entries: [
      "Pintu itu tidak pernah dikunci, dan itulah yang membuat Ibu gelisah.",
      "Sebelum hujan, kampung kami selalu berbau besi.",
      "Aku baru tahu namanya setelah ia pergi.",
    ],
  },
  {
    name: "Kamus diksi",
    hint: "Padanan kata",
    entries: [
      "berjalan: melangkah, menyusuri, menapak, berkelana",
      "melihat: menatap, memandang, mengamati, menengok",
      "sedih: pilu, murung, lara, sendu",
    ],
  },
  {
    name: "Pertanyaan refleksi",
    hint: "Untuk tulisan pribadi",
    entries: [
      "Apa yang kamu tunda hari ini, dan apa yang sebenarnya kamu takutkan darinya?",
      "Siapa yang terakhir kali membuatmu merasa didengarkan?",
      "Kebiasaan kecil apa yang diam-diam menopang harimu?",
    ],
  },
  {
    name: "Ide judul",
    hint: "Pola judul",
    entries: [
      "[Benda] yang Ditinggalkan di [Tempat]",
      "Sebelum [Peristiwa]",
      "Cara [Tokoh] Menunggu",
    ],
  },
  {
    name: "Kalimat penutup",
    hint: "Untuk akhir bagian",
    entries: [
      "Lampu dapur masih menyala sampai pagi.",
      "Ia tidak menoleh, dan aku tidak memanggil.",
      "Di luar, hujan berhenti tanpa memberi tahu siapa pun.",
    ],
  },
  {
    name: "Kamus transisi",
    hint: "Penyambung antarparagraf",
    entries: [
      "waktu: sementara itu, tak lama kemudian, sejak saat itu",
      "kontras: namun, meski begitu, di sisi lain",
      "akibat: karena itu, akhirnya, sebagai gantinya",
    ],
  },
];

const promptsEn = [
  "Write a scene in which your character waits for something they never name.",
  "Describe a house through one smell that still lingers in it.",
  "Open with a sentence someone says in a kitchen. Do not explain who they are until the third paragraph.",
  "Write a letter to someone who has moved away, without once using the word longing.",
  "Pick one object on your desk and write its history from the object's point of view.",
];

const kitsEn: Kit[] = [
  {
    name: "Story ideas",
    hint: "Short premises",
    entries: [
      "A tailor finds notes of body measurements belonging to a person who never came to collect the order.",
      "Two siblings share an inherited house, but only one knows there is a locked room inside it.",
      "The dawn market in a small town has an unwritten rule, and a newcomer breaks it on the first day.",
    ],
  },
  {
    name: "Opening lines",
    hint: "For the first paragraph",
    entries: [
      "The door was never locked, and that was what made Mother uneasy.",
      "Before the rain, our village always smelled of iron.",
      "I only learned her name after she was gone.",
    ],
  },
  {
    name: "Word choice",
    hint: "Alternatives for a word",
    entries: [
      "walk: stride, wander, tread, roam",
      "look: gaze, stare, observe, glance",
      "sad: sorrowful, gloomy, forlorn, wistful",
    ],
  },
  {
    name: "Reflection questions",
    hint: "For personal writing",
    entries: [
      "What are you putting off today, and what do you actually fear about it?",
      "Who was the last person who made you feel heard?",
      "Which small habit quietly holds up your day?",
    ],
  },
  {
    name: "Title ideas",
    hint: "Title patterns",
    entries: ["The [Object] Left Behind in [Place]", "Before [Event]", "How [Character] Waits"],
  },
  {
    name: "Closing lines",
    hint: "For the end of a section",
    entries: [
      "The kitchen light stayed on until morning.",
      "She did not turn around, and I did not call out.",
      "Outside, the rain stopped without telling anyone.",
    ],
  },
  {
    name: "Transition words",
    hint: "Links between paragraphs",
    entries: [
      "time: meanwhile, soon after, ever since",
      "contrast: however, even so, on the other hand",
      "result: therefore, in the end, instead",
    ],
  },
];

/** The inspiration kit and prompts in the interface language. The English text is a translation. */
export function helpContent(locale: Locale): { prompts: string[]; kits: Kit[] } {
  return locale === "en" ? { prompts: promptsEn, kits: kitsEn } : { prompts, kits };
}
