import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const topology = JSON.parse(
  fs.readFileSync(path.join(siteDir, "data", "countries-110m.json"), "utf8"),
);
const outputDir = path.join(siteDir, "static", "images", "itineraries");

const P = (name, lat, lon, label = true, labelDx, labelDy, labelAnchor) => ({ name, lat, lon, label, labelDx, labelDy, labelAnchor });

const routes = [
  {
    slug: "morocco",
    title: "Morocco",
    countries: ["Morocco", "W. Sahara", "Algeria", "Spain", "Mauritania"],
    bounds: [-13.5, 27.0, -0.5, 36.5],
    points: [
      P("Marrakesh", 31.63, -8.0), P("Aït Benhaddou", 31.05, -7.13),
      P("Tinghir", 31.51, -5.53), P("Merzouga", 31.08, -4.01),
      P("Casablanca", 33.57, -7.59), P("Rabat", 34.02, -6.84, false),
      P("Meknes", 33.89, -5.55, false), P("Volubilis", 34.07, -5.55, false),
      P("Fes", 34.03, -5.0), P("Ifrane", 33.53, -5.11, false),
      P("Chefchaouen", 35.17, -5.27, false), P("Tangier", 35.76, -5.83),
    ],
    sectionIndexes: [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5],
  },
  {
    slug: "yunnan",
    title: "Yunnan",
    countries: ["China", "Myanmar", "Laos", "Vietnam"],
    bounds: [97.0, 21.0, 105.2, 29.5],
    points: [
      P("Kunming", 25.04, 102.72), P("Stone Forest", 24.81, 103.32),
      P("Dali", 25.61, 100.27), P("Xizhou", 25.85, 100.13, false),
      P("Lijiang", 26.87, 100.24), P("Jade Dragon Snow Mountain", 27.1, 100.17, false),
      P("Tiger Leaping Gorge", 27.19, 100.09, false), P("Shangri-La", 27.83, 99.7),
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    slug: "tibet",
    title: "Tibet",
    countries: ["China", "Nepal", "India", "Bhutan"],
    bounds: [84.5, 26.5, 92.5, 32.0],
    points: [
      P("Lhasa", 29.65, 91.17), P("Yamdrok Lake", 28.94, 90.69, false),
      P("Gyantse", 28.95, 89.63), P("Shigatse", 29.27, 88.88),
      P("Everest Base Camp", 28.0, 86.86), P("Gyirong", 28.39, 85.33, false),
      P("Nepal border", 28.28, 85.38),
    ],
    sectionIndexes: [0, 3, 3, 3, 4, 5, 6],
  },
  {
    slug: "pearl-delta",
    title: "Pearl River Delta",
    countries: ["China"],
    bounds: [112.7, 21.7, 114.8, 23.7],
    points: [
      P("Shenzhen Bao'an", 22.55, 113.88), P("Hong Kong North", 22.32, 114.17, false),
      P("Lantau", 22.27, 113.95), P("Hong Kong Central", 22.28, 114.16),
      P("Macau", 22.2, 113.54), P("Guangzhou", 23.13, 113.26),
      P("Shenzhen", 22.54, 114.06, false),
    ],
    pathPoints: [
      P("Shenzhen Bao'an", 22.55, 113.88), P("Shenzhen Bay", 22.5, 113.95),
      P("Hong Kong North", 22.32, 114.17), P("Lantau", 22.27, 113.95),
      P("Hong Kong Central", 22.28, 114.16), P("Macau", 22.2, 113.54),
      P("Zhuhai", 22.27, 113.58), P("Zhongshan", 22.52, 113.39),
      P("Guangzhou", 23.13, 113.26), P("Dongguan", 22.99, 113.75),
      P("Shenzhen", 22.54, 114.06),
    ],
    smoothPath: true,
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    slug: "turkmenistan",
    title: "Turkmenistan",
    countries: ["Turkmenistan", "Uzbekistan", "Kazakhstan", "Iran", "Afghanistan"],
    bounds: [52.3, 34.8, 67.2, 43.2],
    points: [
      P("Konye-Urgench", 42.33, 59.15), P("Darvaza", 40.25, 58.44),
      P("Ashgabat", 37.96, 58.33),
    ],
    sectionIndexes: [0, 1, 2],
  },
  {
    slug: "ethiopia",
    title: "Ethiopia",
    countries: ["Ethiopia", "Eritrea", "Djibouti", "Somalia", "Kenya", "Sudan", "S. Sudan"],
    bounds: [32.5, 3.0, 48.5, 15.5],
    points: [
      P("Addis Ababa", 8.98, 38.76), P("Gondar", 12.6, 37.47),
      P("Simien Mountains", 13.25, 38.0), P("Bahir Dar", 11.59, 37.39),
      P("Lalibela", 12.03, 39.04), P("Harar", 9.31, 42.12),
      P("Addis Ababa", 8.98, 38.76, false), P("Arba Minch", 6.04, 37.55),
      P("Omo Valley", 5.0, 36.0), P("Konso", 5.25, 37.48),
      P("Moyale", 3.53, 39.05),
    ],
    sectionIndexes: [0, 1, 2, 5, 7, 11, 12, 13, 14, 15, 15],
  },
  {
    slug: "rwanda",
    title: "Rwanda",
    countries: ["Rwanda", "Uganda", "Burundi", "Tanzania", "Dem. Rep. Congo"],
    bounds: [28.6, -3.0, 31.0, -0.8],
    points: [
      P("Kigali", -1.944, 30.061), P("Musanze", -1.499, 29.635),
      P("Volcanoes NP", -1.46, 29.53, false), P("Kibuye", -2.06, 29.35),
      P("Kigali", -1.944, 30.061, false),
    ],
    sectionIndexes: [0, 2, 3, 4, 5],
  },
  {
    slug: "uganda",
    title: "Uganda",
    countries: ["Uganda", "Kenya", "Tanzania", "Rwanda", "Dem. Rep. Congo", "S. Sudan"],
    bounds: [29.3, -1.7, 35.2, 4.6],
    points: [
      P("Kampala", 0.348, 32.583), P("Fort Portal", 0.67, 30.27),
      P("Rwenzori", 0.38, 29.87, false), P("Kabale", -1.25, 29.99, false),
      P("Lake Bunyonyi", -1.3, 29.92), P("Kampala", 0.348, 32.583, false),
    ],
    sectionIndexes: [0, 2, 3, 5, 6, 8],
  },
  {
    slug: "tanzania",
    title: "Tanzania",
    countries: ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "Mozambique", "Malawi", "Zambia"],
    bounds: [28.5, -12.5, 41.8, -0.7],
    points: [
      P("Arusha", -3.387, 36.683), P("Tarangire", -3.9, 36.0, false),
      P("Ngorongoro", -3.2, 35.5, false), P("Lake Manyara", -3.55, 35.83, false),
      P("Moshi", -3.334, 37.34), P("Lushoto", -4.798, 38.29),
      P("Stone Town", -6.165, 39.2), P("Prison Island", -6.12, 39.17, false),
      P("Kilwa Masoko", -8.96, 39.51), P("Kilwa Kisiwani", -8.96, 39.52, false),
      P("Kilwa Kivinje", -8.75, 39.41, false), P("Dar es Salaam", -6.79, 39.21),
      P("Bagamoyo", -6.44, 38.9, false),
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 6, 8, 10, 12, 13, 14, 15, 16],
    groups: ["Arusha", "Tarangire", "Ngorongoro · Manyara", "Moshi · Lushoto", "Zanzibar", "Kilwa coast", "Dar es Salaam", "Bagamoyo"],
    groupSections: [0, 1, 2, 4, 8, 12, 15, 16],
  },
  {
    slug: "east-africa",
    title: "East Africa",
    countries: ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "Dem. Rep. Congo"],
    bounds: [28.0, -13.0, 43.0, 2.5],
    points: [
      P("Arusha", -3.387, 36.683), P("Tarangire", -3.9, 36.0, false),
      P("Ngorongoro", -3.2, 35.5, false), P("Lake Manyara", -3.55, 35.83, false),
      P("Moshi", -3.334, 37.34, false), P("Lushoto", -4.798, 38.29),
      P("Zanzibar", -6.165, 39.2), P("Kilwa", -8.96, 39.51),
      P("Dar es Salaam", -6.79, 39.21), P("Bagamoyo", -6.44, 38.9, false),
      P("Mombasa", -4.04, 39.67), P("Nairobi", -1.286, 36.82),
      P("Kampala", 0.348, 32.583), P("Fort Portal", 0.67, 30.27, false),
      P("Rwenzori", 0.38, 29.87, false), P("Lake Bunyonyi", -1.3, 29.92, false),
      P("Kigali", -1.944, 30.061, false), P("Musanze", -1.499, 29.635, false),
      P("Kibuye", -2.06, 29.35), P("Kigali", -1.944, 30.061, false),
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 6, 8, 12, 15, 16, 17, 19, 22, 24, 25, 28, 30, 32, 34, 35],
    groups: ["Arusha safari circuit", "Moshi · Lushoto", "Zanzibar", "Kilwa · Dar · Bagamoyo", "Mombasa · Nairobi", "Kampala · Rwenzori", "Kabale · Lake Bunyonyi", "Kigali · Musanze · Kibuye"],
    groupSections: [0, 4, 8, 12, 17, 22, 27, 30],
  },
  {
    slug: "azerbaijan",
    title: "Azerbaijan",
    countries: ["Azerbaijan", "Georgia", "Armenia", "Russia", "Iran"],
    bounds: [44.5, 38.3, 51.0, 42.7],
    countryLabels: [
      P("RUSSIA", 42.45, 48.0), P("GEORGIA", 42.0, 45.1),
      P("ARMENIA", 40.2, 45.0), P("IRAN", 38.75, 47.2),
      P("AZERBAIJAN", 39.75, 47.8),
    ],
    points: [
      P("Baku", 40.41, 49.87), P("Qobustan", 40.09, 49.41, false),
      P("Xinaliq", 41.18, 48.13), P("Sheki", 41.2, 47.17),
      P("Kish", 41.25, 47.2, false),
    ],
    sectionIndexes: [0, 2, 3, 4, 5],
  },
  {
    slug: "georgia",
    title: "Georgia",
    countries: ["Georgia", "Armenia", "Azerbaijan", "Russia", "Turkey"],
    bounds: [39.8, 40.7, 47.8, 43.7],
    points: [
      P("Sighnaghi", 41.62, 45.92), P("Tbilisi", 41.72, 44.79),
      P("Gori", 41.98, 44.11), P("Kazbegi", 42.66, 44.64),
      P("Mtskheta", 41.84, 44.72), P("Tbilisi", 41.72, 44.79, false),
    ],
    sectionIndexes: [0, 1, 3, 4, 5, 5],
  },
  {
    slug: "armenia",
    title: "Armenia",
    countries: ["Armenia", "Georgia", "Azerbaijan", "Turkey", "Iran"],
    bounds: [42.8, 38.5, 47.0, 41.6],
    points: [
      P("Alaverdi", 41.1, 44.66), P("Yerevan", 40.18, 44.51),
      P("Etchmiadzin", 40.16, 44.29, false), P("Garni", 40.12, 44.73),
      P("Khor Virap", 39.88, 44.58),
    ],
    sectionIndexes: [0, 1, 2, 3, 3],
  },
  {
    slug: "central-asia",
    title: "Central Asia",
    countries: ["Kazakhstan", "Kyrgyzstan", "Tajikistan", "Uzbekistan", "Turkmenistan"],
    bounds: [45.0, 34.0, 88.0, 56.0],
    points: [
      P("Aktau", 43.65, 51.16), P("Torysh", 44.34, 51.76, false),
      P("Bozzhyra", 43.42, 54.08, false), P("Astana", 51.17, 71.45),
      P("Almaty", 43.24, 76.89), P("Charyn", 43.35, 79.08, false),
      P("Kolsai", 42.98, 78.32, false), P("Bishkek", 42.87, 74.57, false),
      P("Song-Kul", 41.84, 75.15, false), P("Karakol", 42.49, 78.39, false),
      P("Osh", 40.53, 72.8), P("Tulpar-Kul", 39.45, 72.9, false),
      P("Karakul", 39.02, 73.53, false), P("Murghab", 38.17, 73.97, false),
      P("Wakhan Valley", 37.02, 72.66, false), P("Kalaikhum", 38.47, 70.79, false),
      P("Dushanbe", 38.56, 68.78), P("Panjakent", 39.5, 67.61, false),
      P("Khujand", 40.28, 69.63, false), P("Tashkent", 41.31, 69.24),
      P("Samarkand", 39.65, 66.96), P("Bukhara", 39.77, 64.42),
      P("Khiva", 41.38, 60.36), P("Nukus", 42.46, 59.61, false),
      P("Konye-Urgench", 42.33, 59.15, false), P("Darvaza", 40.25, 58.44, false),
      P("Ashgabat", 37.96, 58.33),
    ],
    sectionIndexes: [0, 1, 2, 4, 6, 8, 8, 11, 13, 14, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    groups: ["Aktau · Mangystau", "Astana · Almaty", "Almaty day trips", "Bishkek · Song-Kul", "Karakol · Osh", "Pamir Highway", "Dushanbe · Khujand", "Tashkent · Samarkand", "Bukhara · Khiva · Nukus", "Konye-Urgench · Ashgabat"],
    groupSections: [0, 4, 6, 11, 14, 20, 25, 28, 30, 33],
  },
  {
    slug: "tajikistan",
    title: "Tajikistan",
    countries: ["Tajikistan", "Kyrgyzstan", "Uzbekistan", "Afghanistan", "China"],
    bounds: [66.2, 36.2, 75.5, 41.4],
    countryLabels: [
      P("UZBEKISTAN", 39.5, 66.9), P("KYRGYZSTAN", 40.9, 72.5),
      P("CHINA", 38.7, 75.0), P("AFGHANISTAN", 36.7, 70.3),
      P("TAJIKISTAN", 39.4, 70.5),
    ],
    points: [
      P("Karakul", 39.02, 73.53), P("Murghab", 38.17, 73.97),
      P("Langar", 37.05, 72.68), P("Yamchun", 36.7, 71.84),
      P("Khorog", 37.49, 71.55), P("Kalaikhum", 38.47, 70.79),
      P("Dushanbe", 38.56, 68.78), P("Panjakent", 39.5, 67.61),
      P("Seven Lakes", 39.16, 67.8), P("Khujand", 40.28, 69.63),
    ],
    sectionIndexes: [0, 1, 2, 3, 3, 4, 5, 6, 7, 9],
  },
  {
    slug: "mexico",
    title: "Mexico",
    countries: ["Mexico", "Guatemala", "Belize"],
    bounds: [-100.5, 15.0, -86.0, 22.5],
    points: [
      P("Mexico City", 19.43, -99.13), P("Puebla", 19.04, -98.2),
      P("Oaxaca", 17.06, -96.73), P("San Cristobal", 16.74, -92.64),
      P("Palenque", 17.51, -91.98), P("Merida", 20.97, -89.62),
      P("Izamal", 20.93, -89.02, false), P("Valladolid", 20.69, -88.2),
      P("Tulum", 20.17, -87.45), P("Cancun", 21.16, -86.85),
    ],
    sectionIndexes: [0, 3, 4, 6, 8, 10, 11, 12, 14, 16],
  },
  {
    slug: "peru",
    title: "Peru",
    countries: ["Peru", "Ecuador", "Colombia", "Brazil", "Bolivia", "Chile"],
    bounds: [-82.0, -19.0, -67.0, 1.0],
    points: [
      P("Lima", -12.06, -77.04), P("Huaraz", -9.53, -77.53),
      P("Trujillo", -8.11, -79.03), P("Paracas", -13.84, -76.25),
      P("Ica", -14.06, -75.73, false), P("Nazca", -14.83, -74.94, false),
      P("Arequipa", -16.4, -71.54), P("Cusco", -13.52, -71.98),
      P("Machu Picchu", -13.16, -72.55, false), P("Puerto Maldonado", -12.59, -69.19),
      P("Puno", -15.84, -70.03), P("Copacabana", -16.17, -69.09, false),
    ],
    sectionIndexes: [0, 1, 5, 7, 8, 9, 10, 12, 18, 20, 24, 25],
  },
  {
    slug: "bolivia",
    title: "Bolivia",
    countries: ["Bolivia", "Peru", "Brazil", "Paraguay", "Argentina", "Chile"],
    bounds: [-71.5, -24.0, -56.5, -9.0],
    points: [
      P("Copacabana", -16.17, -69.09, true, -14, -14, "end"), P("Isla del Sol", -16.02, -69.16, false),
      P("La Paz", -16.5, -68.13, true, 14, 24, "start"), P("Cochabamba", -17.39, -66.16, true, -14, -16, "end"),
      P("Torotoro", -18.13, -65.77, true, 16, 18, "start"), P("Sucre", -19.05, -65.26, true, 16, 25, "start"),
      P("Potosi", -19.59, -65.75, true, -14, -12, "end"), P("Uyuni", -20.46, -66.82),
      P("San Pedro de Atacama", -22.91, -68.2, false),
    ],
    sectionIndexes: [0, 1, 2, 3, 5, 7, 10, 12, 15],
  },
  {
    slug: "chile",
    title: "Chile",
    countries: ["Chile", "Argentina", "Bolivia", "Peru"],
    bounds: [-76.0, -56.5, -63.0, -17.0],
    points: [
      P("San Pedro de Atacama", -22.91, -68.2), P("Santiago", -33.44, -70.65),
      P("Punta Arenas", -53.16, -70.91, true, 16, 25, "start"), P("Puerto Natales", -51.73, -72.51, true, -16, 30, "end"),
      P("Torres del Paine", -50.94, -73.41, true, -16, -16, "end"), P("El Calafate", -50.34, -72.27, true, 16, 22, "start"),
      P("El Chalten", -49.33, -72.89, true, 16, -16, "start"), P("Perito Moreno", -50.5, -73.05, false),
    ],
    sectionIndexes: [0, 3, 4, 5, 6, 8, 9, 10],
  },
  {
    slug: "south-america",
    title: "South America",
    countries: ["Peru", "Bolivia", "Chile", "Argentina"],
    bounds: [-82.0, -56.5, -63.0, -7.0],
    points: [
      P("Lima", -12.06, -77.04), P("Huaraz", -9.53, -77.53),
      P("Trujillo", -8.11, -79.03, false), P("Paracas", -13.84, -76.25),
      P("Ica", -14.06, -75.73, false), P("Nazca", -14.83, -74.94, false),
      P("Arequipa", -16.4, -71.54), P("Cusco", -13.52, -71.98),
      P("Machu Picchu", -13.16, -72.55, false), P("Puerto Maldonado", -12.59, -69.19),
      P("Puno", -15.84, -70.03), P("Copacabana", -16.17, -69.09, false),
      P("La Paz", -16.5, -68.13), P("Cochabamba", -17.39, -66.16, false),
      P("Torotoro", -18.13, -65.77, false), P("Sucre", -19.05, -65.26),
      P("Potosi", -19.59, -65.75, false), P("Uyuni", -20.46, -66.82),
      P("San Pedro de Atacama", -22.91, -68.2), P("Santiago", -33.44, -70.65),
      P("Punta Arenas", -53.16, -70.91), P("Puerto Natales", -51.73, -72.51, false),
      P("El Calafate", -50.34, -72.27), P("El Chalten", -49.33, -72.89, true, 14, -16, "start"),
      P("Perito Moreno", -50.5, -73.14, true, -14, 24, "end"),
    ],
    sectionIndexes: [0, 1, 5, 7, 8, 9, 10, 12, 18, 20, 23, 25, 27, 28, 30, 32, 35, 37, 41, 43, 45, 46, 49, 50, 51],
    pathPoints: [
      P("Lima", -12.06, -77.04), P("Huaraz", -9.53, -77.53), P("Trujillo", -8.11, -79.03),
      P("Paracas", -13.84, -76.25), P("Ica", -14.06, -75.73), P("Nazca", -14.83, -74.94),
      P("Arequipa", -16.4, -71.54), P("Cusco", -13.52, -71.98), P("Machu Picchu", -13.16, -72.55),
      P("Cusco", -13.52, -71.98), P("Puerto Maldonado", -12.59, -69.19), P("Puno", -15.84, -70.03),
      P("Copacabana", -16.17, -69.09), P("La Paz", -16.5, -68.13), P("Cochabamba", -17.39, -66.16),
      P("Torotoro", -18.13, -65.77), P("Cochabamba", -17.39, -66.16), P("Sucre", -19.05, -65.26),
      P("Potosi", -19.59, -65.75), P("Uyuni", -20.46, -66.82), P("San Pedro de Atacama", -22.91, -68.2),
      P("Santiago", -33.44, -70.65), P("Punta Arenas", -53.16, -70.91), P("Puerto Natales", -51.73, -72.51),
      P("El Calafate", -50.34, -72.27), P("El Chalten", -49.33, -72.89), P("El Calafate", -50.34, -72.27),
      P("Perito Moreno", -50.5, -73.14), P("El Calafate", -50.34, -72.27), P("Puerto Natales", -51.73, -72.51),
      P("Punta Arenas", -53.16, -70.91),
    ],
    groups: ["Lima", "Huaraz · Trujillo", "Paracas · Ica · Nazca", "Arequipa", "Cusco · Machu Picchu", "Puerto Maldonado · Titicaca", "La Paz · Torotoro", "Cochabamba · Sucre · Potosi", "Uyuni · Atacama", "Santiago · Patagonia"],
    groupSections: [0, 1, 7, 10, 12, 20, 27, 28, 37, 43],
  },
  {
    slug: "vietnam",
    title: "Vietnam",
    countries: ["Vietnam", "Laos", "Cambodia", "China"],
    bounds: [102.0, 8.0, 110.5, 24.0],
    points: [
      P("Hanoi", 21.03, 105.85), P("Ha Giang", 22.83, 104.98),
      P("Ha Long", 20.95, 107.08), P("Ninh Binh", 20.25, 105.98),
      P("Hue", 16.46, 107.59), P("An Bang", 16.45, 107.8, false),
      P("Da Nang", 16.07, 108.21), P("Hoi An", 15.88, 108.33),
      P("Ho Chi Minh City", 10.78, 106.7), P("Phu Quoc", 10.22, 103.99),
    ],
    sectionIndexes: [0, 2, 6, 9, 11, 13, 14, 16, 18, 22],
  },
  {
    slug: "india",
    title: "Northern India",
    countries: ["India", "Nepal", "Bangladesh", "Bhutan", "Pakistan"],
    bounds: [74.5, 22.0, 89.5, 31.5],
    points: [
      P("Sonauli border", 27.47, 83.47), P("Gorakhpur", 26.76, 83.37, false),
      P("Varanasi", 25.32, 82.97), P("Sarnath", 25.38, 83.02, false),
      P("Agra", 27.18, 78.01), P("Delhi", 28.61, 77.21),
    ],
    sectionIndexes: [0, 0, 0, 2, 3, 4],
  },
  {
    slug: "nepal",
    title: "Nepal",
    countries: ["Nepal", "India", "China", "Bhutan", "Bangladesh"],
    bounds: [79.5, 25.5, 89.5, 31.0],
    points: [
      P("Gyirong border", 28.28, 85.38), P("Kathmandu", 27.72, 85.32),
      P("Bhaktapur", 27.67, 85.43), P("Nagarkot", 27.72, 85.52, false),
      P("Patan", 27.67, 85.32), P("Lumbini", 27.48, 83.28),
      P("Sonauli border", 27.47, 83.47, false),
    ],
    sectionIndexes: [0, 0, 1, 1, 3, 4, 4],
  },
  {
    slug: "laos",
    title: "Laos",
    countries: ["Laos", "Thailand", "Cambodia", "Vietnam", "China"],
    bounds: [99.5, 12.5, 107.5, 23.5],
    points: [
      P("Vientiane", 17.98, 102.63), P("Luang Prabang", 19.89, 102.14),
      P("Nong Khiaw", 20.57, 102.61),
      P("Muang Ngoi", 20.71, 102.68, false), P("Luang Namtha", 20.95, 101.4),
      P("Thakhek", 17.41, 104.83), P("Kong Lor", 17.95, 104.75, false),
      P("Pakse", 15.12, 105.8), P("Bolaven Plateau", 15.2, 106.25, false),
      P("Don Khon", 13.96, 105.92),
    ],
    sectionIndexes: [0, 1, 3, 4, 5, 7, 8, 9, 10, 12],
  },
  {
    slug: "philippines",
    title: "The Philippines",
    countries: ["Philippines"],
    bounds: [116.5, 7.0, 126.5, 19.5],
    points: [
      P("Manila", 14.59, 120.98), P("Banaue", 16.91, 121.06),
      P("Cebu City", 10.29, 123.9), P("Panglao", 9.58, 123.75),
    ],
    sectionIndexes: [0, 2, 4, 6],
  },
  {
    slug: "taiwan",
    title: "Taiwan",
    countries: ["Taiwan"],
    bounds: [119.5, 21.5, 122.5, 25.6],
    points: [
      P("Taipei", 25.04, 121.56), P("Jiufen", 25.11, 121.84),
      P("Hualien", 23.98, 121.61),
      P("Kaohsiung", 22.62, 120.31), P("Taichung", 24.16, 120.65),
      P("Sun Moon Lake", 23.86, 120.92), P("Taipei (return)", 25.03, 121.49),
    ],
    sectionIndexes: [0, 2, 3, 5, 7, 8, 9],
  },
  {
    slug: "new-zealand",
    title: "New Zealand",
    countries: ["New Zealand"],
    bounds: [165.0, -48.0, 179.5, -34.0],
    points: [
      P("Auckland", -36.85, 174.76), P("Tongariro", -39.24, 175.54),
      P("Wellington", -41.29, 174.78), P("Nelson", -41.27, 173.28),
      P("Franz Josef", -43.39, 170.18), P("Queenstown", -45.03, 168.66),
      P("Te Anau", -45.41, 167.72), P("Christchurch", -43.53, 172.64),
    ],
    sectionIndexes: [0, 1, 3, 5, 7, 8, 10, 11],
  },
  {
    slug: "australia",
    title: "Australia's Northern Territory",
    countries: ["Australia"],
    bounds: [128.0, -27.0, 139.0, -10.0],
    points: [
      P("Alice Springs", -23.7, 133.88), P("Uluru", -25.34, 131.04),
      P("Kings Canyon", -24.26, 131.56),
      P("Darwin", -12.46, 130.84),
    ],
    sectionIndexes: [0, 1, 3, 4],
  },
  {
    slug: "indonesia",
    title: "Java: Bali to Jakarta",
    countries: ["Indonesia"],
    bounds: [105.0, -9.5, 116.5, -5.0],
    points: [
      P("Ubud", -8.51, 115.26), P("Banyuwangi", -8.21, 114.37),
      P("Probolinggo", -7.74, 113.22), P("Yogyakarta", -7.8, 110.36),
      P("Temanggung", -7.32, 110.18), P("Semarang", -6.97, 110.42),
      P("Jakarta", -6.18, 106.83),
    ],
    sectionIndexes: [0, 2, 4, 6, 8, 10, 11],
  },
  {
    slug: "kazakhstan",
    title: "Kazakhstan",
    countries: ["Kazakhstan"],
    bounds: [45.0, 39.0, 88.0, 56.5],
    points: [
      P("Aktau", 43.65, 51.16), P("Torysh", 44.32, 51.74),
      P("Bozjyra", 43.42, 54.07), P("Bokty", 43.1, 53.82, false),
      P("Astana", 51.17, 71.43), P("Aqmola", 51.0, 70.95, false),
      P("Almaty", 43.24, 76.89), P("Big Almaty Lake", 43.05, 76.99, false),
      P("Kolsai · Charyn", 43.0, 78.65), P("Shymbulak", 43.13, 77.08, false),
      P("Bishkek road", 42.87, 74.6),
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11],
  },
  {
    slug: "caucasus",
    title: "The Caucasus",
    countries: ["Azerbaijan", "Georgia", "Armenia"],
    bounds: [39.0, 37.5, 51.0, 43.8],
    points: [
      P("Baku", 40.41, 49.87), P("Xinaliq", 41.18, 48.13),
      P("Sheki", 41.19, 47.17), P("Sighnaghi", 41.62, 45.92),
      P("Tbilisi", 41.72, 44.83), P("Gori", 41.98, 44.12),
      P("Kazbegi", 42.66, 44.64), P("Mtskheta", 41.84, 44.72),
      P("Alaverdi", 41.1, 44.66), P("Yerevan", 40.19, 44.52),
      P("Etchmiadzin", 40.16, 44.29, false), P("Garni", 40.11, 44.73),
      P("Khor Virap", 39.88, 44.58),
    ],
    sectionIndexes: [0, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15, 15],
  },
  {
    slug: "kyrgyzstan",
    title: "Kyrgyzstan",
    countries: ["Kyrgyzstan"],
    bounds: [68.0, 38.8, 81.2, 44.0],
    points: [
      P("Bishkek", 42.87, 74.57), P("Ala-Archa", 42.64, 74.49),
      P("Kyzart", 42.0, 74.95), P("Song-Kul", 41.84, 75.15),
      P("Karakol", 42.49, 78.39), P("Jeti-Ögüz", 42.33, 78.24),
      P("Altyn Arashan", 42.35, 78.61), P("Osh", 40.53, 72.8),
      P("Tulpar-Kul", 39.49, 72.9), P("Peak Lenin", 39.35, 72.88),
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 6, 7, 8, 10, 11],
  },
  {
    slug: "uzbekistan",
    title: "Uzbekistan",
    countries: ["Uzbekistan"],
    bounds: [54.0, 36.5, 73.0, 46.5],
    points: [
      P("Tashkent", 41.3, 69.24), P("Samarkand", 39.65, 66.96),
      P("Bukhara", 39.77, 64.46), P("Khiva", 41.38, 60.36),
      P("Nukus", 42.46, 59.61), P("Muynak", 43.77, 59.03),
    ],
    sectionIndexes: [0, 2, 4, 6, 8, 9],
  },
  {
    slug: "patagonia",
    title: "Patagonia",
    countries: ["Chile", "Argentina"],
    bounds: [-75.5, -54.5, -67.5, -48.0],
    points: [
      P("Punta Arenas", -53.16, -70.92), P("Puerto Natales", -51.73, -72.51),
      P("Torres del Paine", -50.94, -73.41), P("Base Torres", -50.94, -72.99),
      P("El Calafate", -50.34, -72.26), P("El Chaltén", -49.33, -72.89),
      P("Perito Moreno", -50.5, -73.14),
    ],
    pathPoints: [
      P("Punta Arenas", -53.16, -70.92), P("Puerto Natales", -51.73, -72.51),
      P("Torres del Paine", -50.94, -73.41), P("Base Torres", -50.94, -72.99),
      P("Puerto Natales", -51.73, -72.51, false), P("El Calafate", -50.34, -72.26),
      P("El Chaltén", -49.33, -72.89), P("El Calafate", -50.34, -72.26, false),
      P("Perito Moreno", -50.5, -73.14), P("El Calafate", -50.34, -72.26, false),
      P("Puerto Natales", -51.73, -72.51, false), P("Punta Arenas", -53.16, -70.92, false),
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6],
  },
];

function decodeArc(index) {
  const reversed = index < 0;
  const arc = topology.arcs[reversed ? ~index : index];
  let x = 0;
  let y = 0;
  const coordinates = arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [
      x * topology.transform.scale[0] + topology.transform.translate[0],
      y * topology.transform.scale[1] + topology.transform.translate[1],
    ];
  });
  return reversed ? coordinates.reverse() : coordinates;
}

function stitch(indices) {
  const ring = [];
  indices.forEach((index, arcIndex) => {
    const points = decodeArc(index);
    ring.push(...(arcIndex === 0 ? points : points.slice(1)));
  });
  return ring;
}

function geometryRings(geometry) {
  if (geometry.type === "Polygon") return geometry.arcs.map(stitch);
  if (geometry.type === "MultiPolygon") return geometry.arcs.flatMap((polygon) => polygon.map(stitch));
  return [];
}

function ringBounds(ring) {
  return ring.reduce((bounds, [lon, lat]) => [
    Math.min(bounds[0], lon), Math.min(bounds[1], lat),
    Math.max(bounds[2], lon), Math.max(bounds[3], lat),
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}

function visibleGeometry(geometry, mapBounds) {
  const [mapMinLon, mapMinLat, mapMaxLon, mapMaxLat] = mapBounds;
  const overlaps = geometryRings(geometry).map(ringBounds).map((bounds) => {
    const minLon = Math.max(bounds[0], mapMinLon);
    const minLat = Math.max(bounds[1], mapMinLat);
    const maxLon = Math.min(bounds[2], mapMaxLon);
    const maxLat = Math.min(bounds[3], mapMaxLat);
    return { minLon, minLat, maxLon, maxLat, area: Math.max(0, maxLon - minLon) * Math.max(0, maxLat - minLat) };
  }).filter((overlap) => overlap.area > 0);
  if (!overlaps.length) return null;
  return overlaps.reduce((largest, overlap) => overlap.area > largest.area ? overlap : largest);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function makeProjector(bounds) {
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const map = { x: 42, y: 82, width: 810, height: 620 };
  const cosine = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = (maxLon - minLon) * cosine;
  const spanY = maxLat - minLat;
  const scale = Math.min(map.width / spanX, map.height / spanY);
  const offsetX = map.x + (map.width - spanX * scale) / 2;
  const offsetY = map.y + (map.height - spanY * scale) / 2;
  return ([lon, lat]) => [
    offsetX + (lon - minLon) * cosine * scale,
    offsetY + (maxLat - lat) * scale,
  ];
}

function linePath(points, project, smooth = false) {
  const projected = points.map((point) => project([point.lon, point.lat]));
  if (!smooth || projected.length < 3) {
    return projected.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  }
  const commands = [`M${projected[0][0].toFixed(1)},${projected[0][1].toFixed(1)}`];
  for (let index = 1; index < projected.length - 1; index += 1) {
    const [x, y] = projected[index];
    const [nextX, nextY] = projected[index + 1];
    commands.push(`Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nextX) / 2).toFixed(1)},${((y + nextY) / 2).toFixed(1)}`);
  }
  const [lastX, lastY] = projected[projected.length - 1];
  commands.push(`L${lastX.toFixed(1)},${lastY.toFixed(1)}`);
  return commands.join(" ");
}

function countryPath(geometry, project) {
  return geometryRings(geometry).map((ring) => {
    const points = ring.map((coordinate) => project(coordinate));
    return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z";
  }).join(" ");
}

function markerLabel(point, index, project, section) {
  if (!point.label) return "";
  const [x, y] = project([point.lon, point.lat]);
  const anchor = point.labelAnchor ?? (x > 650 ? "end" : "start");
  const dx = point.labelDx ?? (anchor === "end" ? -12 : 12);
  const dy = point.labelDy ?? (index % 2 === 0 ? -10 : 18);
  return `<text class="place-label stop-link" data-section="${section}" data-stop-name="${escapeXml(point.name)}" x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${escapeXml(point.name)}</text>`;
}

function wrapWords(value, maxChars = 29) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!line || `${line} ${word}`.length <= maxChars) line = line ? `${line} ${word}` : word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function routeSummary(route) {
  const items = route.groups
    ? route.groups.map((text, index) => ({ text, section: route.groupSections[index] }))
    : route.points.map((point, index) => ({ text: `${index + 1}. ${point.name}`, section: route.sectionIndexes?.[index] ?? index }));
  const lineHeight = Math.min(58, 540 / items.length);
  return items.map((item, index) => {
    const y = 145 + index * lineHeight;
    const number = route.groups ? String(index + 1).padStart(2, "0") : "";
    const lines = wrapWords(item.text);
    const text = lines.map((line, lineIndex) => `<tspan x="${number ? 34 : 0}" dy="${lineIndex === 0 ? 0 : 17}">${escapeXml(line)}</tspan>`).join("");
    return `<g class="summary-stop stop-link" data-section="${item.section}" data-stop-name="${escapeXml(item.text)}" transform="translate(900 ${y.toFixed(1)})">
      ${number ? `<text class="summary-number" x="0" y="0">${number}</text>` : ""}
      <text class="summary-text" x="${number ? 34 : 0}" y="0">${text}</text>
    </g>`;
  }).join("\n");
}

function renderRoute(route) {
  const project = makeProjector(route.bounds);
  const allGeometries = topology.objects.countries.geometries;
  const missing = route.countries.filter((name) => !allGeometries.some((geometry) => geometry.properties.name === name));
  if (missing.length) throw new Error(`${route.slug}: missing country geometries: ${missing.join(", ")}`);

  const visibleGeometries = allGeometries.map((geometry) => ({
    geometry,
    visible: visibleGeometry(geometry, route.bounds),
    isRouteCountry: route.countries.includes(geometry.properties.name),
  })).filter((item) => item.visible).sort((left, right) => Number(left.isRouteCountry) - Number(right.isRouteCountry));

  const countryPaths = visibleGeometries.map(({ geometry, isRouteCountry }) =>
    `<path class="country${isRouteCountry ? " route-country" : " context-country"}" d="${countryPath(geometry, project)}"><title>${escapeXml(geometry.properties.name)}</title></path>`,
  ).join("\n");

  const manualCountryNames = new Set((route.countryLabels ?? []).map((label) => label.name.toLowerCase()));
  const automaticCountryLabels = visibleGeometries.filter(({ geometry, visible }) => {
    if (manualCountryNames.has(geometry.properties.name.toLowerCase())) return false;
    const [minX, maxY] = project([visible.minLon, visible.minLat]);
    const [maxX, minY] = project([visible.maxLon, visible.maxLat]);
    return Math.abs(maxX - minX) >= 48 && Math.abs(maxY - minY) >= 24;
  }).map(({ geometry, visible }) => ({
    name: geometry.properties.name,
    lon: (visible.minLon + visible.maxLon) / 2,
    lat: (visible.minLat + visible.maxLat) / 2,
  }));
  const countryLabels = [...automaticCountryLabels, ...(route.countryLabels ?? [])].map((label) => {
    const [x, y] = project([label.lon, label.lat]);
    return `<text class="country-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${escapeXml(label.name)}</text>`;
  }).join("\n");
  const routePath = linePath(route.pathPoints ?? route.points, project, route.smoothPath);
  const dense = Boolean(route.groups);
  const seenCoordinates = new Set();
  const markers = route.points.map((point, index) => {
    const coordinateKey = `${point.lat.toFixed(3)},${point.lon.toFixed(3)}`;
    if (seenCoordinates.has(coordinateKey)) return "";
    seenCoordinates.add(coordinateKey);
    const [x, y] = project([point.lon, point.lat]);
    const section = route.sectionIndexes?.[index] ?? index;
    const kind = index === 0 ? " start" : index === route.points.length - 1 ? " end" : "";
    return `<g class="stop stop-link${kind}" data-section="${section}" data-stop-name="${escapeXml(point.name)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <circle r="${dense ? 7 : 10}" />
      ${dense ? "" : `<text x="0" y="4">${index + 1}</text>`}
      <title>${index + 1}. ${escapeXml(point.name)}</title>
    </g>`;
  }).join("\n");
  const labels = route.points.map((point, index) => markerLabel(point, index, project, route.sectionIndexes?.[index] ?? index)).join("\n");
  const description = `${route.title} itinerary: ${route.points.map((point) => point.name).join(", ")}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(route.title)} route map</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.16" /></filter>
    <clipPath id="map-clip"><rect x="42" y="82" width="810" height="620" rx="18" /></clipPath>
  </defs>
  <style>
    .background{fill:#f5f1e9}.map-frame{fill:#dce8ea}.country{stroke:#8b8a82;stroke-width:1.4;vector-effect:non-scaling-stroke}.context-country{fill:#eeeae1;stroke:#aaa79f}.route-country{fill:#d8d0bf;stroke:#74736d;stroke-width:1.7}.country-label{font:700 10px Arial,sans-serif;fill:#77736b;letter-spacing:1px;text-anchor:middle;paint-order:stroke;stroke:#f1ede5;stroke-width:3px}.route-halo{fill:none;stroke:#fff;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;opacity:.82}.route{fill:none;stroke:#d45545;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.stop circle{fill:#d45545;stroke:#fff;stroke-width:2.5;filter:url(#shadow);transition:stroke-width .15s ease}.stop.start circle{fill:#24735c}.stop.end circle{stroke:#71312d;stroke-width:3}.stop text{font:700 10px Arial,sans-serif;fill:#fff;text-anchor:middle}.place-label{font:600 14px Arial,sans-serif;fill:#292824;paint-order:stroke;stroke:#f5f1e9;stroke-width:4;stroke-linejoin:round}.title{font:700 34px Georgia,serif;fill:#292824}.route-title{font:700 13px Arial,sans-serif;fill:#77736b;letter-spacing:2px}.summary-number{font:700 13px Arial,sans-serif;fill:#d45545}.summary-text{font:600 14px Arial,sans-serif;fill:#292824}.attribution{font:11px Arial,sans-serif;fill:#77736b}.divider{stroke:#cbc5b9;stroke-width:1}.stop-link{cursor:pointer;outline:none}.summary-text,.place-label{transition:fill .15s ease}.summary-stop:hover .summary-text,.summary-stop:focus-visible .summary-text,.summary-stop.is-linked-hover .summary-text,.place-label:hover,.place-label:focus-visible,.place-label.is-linked-hover{fill:#a83d35;text-decoration:underline}.stop:hover circle,.stop:focus-visible circle,.stop.is-linked-hover circle{stroke:#292824;stroke-width:4}.lightbox-map .divider,.lightbox-map .route-title,.lightbox-map .summary-stop{display:none}
  </style>
  <rect class="background" width="1200" height="760" rx="24" />
  <text class="title" x="42" y="52">${escapeXml(route.title)}</text>
  <rect class="map-frame" x="42" y="82" width="810" height="620" rx="18" />
  <g clip-path="url(#map-clip)">
    ${countryPaths}
    ${countryLabels}
    <path class="route-halo" d="${routePath}" />
    <path class="route" d="${routePath}" />
    ${markers}
    ${labels}
  </g>
  <line class="divider" x1="878" y1="82" x2="878" y2="702" />
  <text class="route-title" x="900" y="108">ROUTE</text>
  ${routeSummary(route)}
  <text class="attribution" x="42" y="735">Country boundaries: Natural Earth via world-atlas · Route positions are approximate</text>
</svg>`;
}

fs.mkdirSync(outputDir, { recursive: true });
for (const route of routes) {
  const outputPath = path.join(outputDir, `${route.slug}.svg`);
  if (route.preserveExistingMap && fs.existsSync(outputPath)) continue;
  fs.writeFileSync(outputPath, renderRoute(route), "utf8");
}

console.log(`Generated ${routes.length} itinerary maps in ${outputDir}`);
