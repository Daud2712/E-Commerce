// Tanzania Regions, Districts, and Postal Codes
export interface Ward {
  name: string;
  postcode: string;
  streets?: string[];
}

export interface District {
  name: string;
  postcode: string;
  wards: Ward[];
  coordinates?: { lat: number; lng: number };
}

export interface Region {
  name: string;
  postcode: string;
  districts: District[];
  coordinates?: { lat: number; lng: number };
}

export const tanzaniaLocations: Region[] = [
  {
    name: 'Dar es Salaam',
    postcode: '11000',
    coordinates: { lat: -6.7924, lng: 39.2083 },
    districts: [
      {
        name: 'Ilala',
        postcode: '11101',
        coordinates: { lat: -6.8160, lng: 39.2803 },
        wards: [
          { name: 'Kariakoo', postcode: '11101', streets: ['Mkunguni Street', 'Tandamuti Street', 'Uhuru Street', 'Msimbazi Street', 'Livingstone Street', 'Sikukuu Street', 'Lindi Street'] },
          { name: 'Mchikichini', postcode: '11102', streets: ['Mchikichini Road', 'Magore Street', 'Libya Street', 'Kitunda Street', 'Msimbazi Road'] },
          { name: 'Kisutu', postcode: '11103', streets: ['Sokoine Drive', 'Samora Avenue', 'Azikiwe Street', 'Ohio Street', 'Garden Avenue', 'Jamhuri Street'] },
          { name: 'Jangwani', postcode: '11104', streets: ['Jangwani Street', 'Kitunda Road', 'Kawawa Road', 'Msimbazi Valley Road'] },
          { name: 'Buguruni', postcode: '11105', streets: ['Buguruni Road', 'Mbezi Road', 'Kilwa Road', 'Nyerere Road', 'Mandela Road'] },
          { name: 'Ilala', postcode: '11106', streets: ['Ilala Boma Road', 'Nyerere Road', 'Kilwa Road', 'Pugu Road'] },
          { name: 'Vingunguti', postcode: '11107', streets: ['Vingunguti Road', 'Kilwa Road', 'Tabata Road', 'Chanika Road'] },
          { name: 'Gerezani', postcode: '11108', streets: ['Gerezani Street', 'Sokoine Drive', 'Morogoro Road', 'Bibi Titi Mohamed Street'] },
          { name: 'Kipawa', postcode: '11109', streets: ['Kipawa Street', 'Kawawa Road', 'Msimbazi Road'] },
          { name: 'Kivukoni', postcode: '11110', streets: ['Kivukoni Front', 'Ocean Road', 'Shaaban Robert Street', 'Ohio Street', 'Maktaba Street'] },
          { name: 'Upanga East', postcode: '11111', streets: ['United Nations Road', 'Kisutu Street', 'Makunganya Street', 'Mindu Street', 'Upanga Road'] },
          { name: 'Upanga West', postcode: '11112', streets: ['Kinondoni Road', 'Makunganya Street', 'Chang\'ombe Road', 'Magila Road'] },
          { name: 'Kiwalani', postcode: '11113', streets: ['Kilwa Road', 'Kiwalani Road', 'Nyerere Road'] },
          { name: 'Pugu', postcode: '11114', streets: ['Pugu Road', 'Kilwa Road', 'Chanika Road'] },
          { name: 'Segerea', postcode: '11115', streets: ['Segerea Road', 'Tabata Road', 'Kimara Road'] },
          { name: 'Tabata', postcode: '11116', streets: ['Tabata Relini', 'Tabata Segerea Road', 'Kilwa Road', 'Mandela Road'] },
          { name: 'Kinyerezi', postcode: '11117', streets: ['Kinyerezi Road', 'Kilwa Road', 'Pugu Road'] },
        ]
      },
      {
        name: 'Kinondoni',
        postcode: '14100',
        coordinates: { lat: -6.7333, lng: 39.2167 },
        wards: [
          { name: 'Msasani', postcode: '14101', streets: ['Haile Selassie Road', 'Msasani Peninsula', 'Toure Drive', 'Chole Road', 'Slipway Road', 'Oyster Bay'] },
          { name: 'Mikocheni', postcode: '14102', streets: ['Mikocheni Road', 'Mwai Kibaki Road', 'Sam Nujoma Road', 'Kinondoni Road', 'Ali Hassan Mwinyi Road'] },
          { name: 'Mwananyamala', postcode: '14103', streets: ['Mwananyamala Road', 'Kawawa Road', 'Kinondoni Road', 'Shekilango Road'] },
          { name: 'Sinza', postcode: '14104', streets: ['Sinza Road', 'Mwai Kibaki Road', 'Bagamoyo Road', 'Kinondoni Road'] },
          { name: 'Manzese', postcode: '14105', streets: ['Manzese Road', 'Kawawa Road', 'Morogoro Road', 'Mandela Road'] },
          { name: 'Tandale', postcode: '14106', streets: ['Tandale Road', 'Kawawa Road', 'Mwananyamala Road'] },
          { name: 'Kijitonyama', postcode: '14107', streets: ['Kijitonyama Road', 'Mwai Kibaki Road', 'Bagamoyo Road'] },
          { name: 'Magomeni', postcode: '14108', streets: ['Magomeni Road', 'Morogoro Road', 'Kinondoni Road', 'Kawawa Road'] },
          { name: 'Kinondoni', postcode: '14109', streets: ['Kinondoni Road', 'Morogoro Road', 'Ali Hassan Mwinyi Road'] },
          { name: 'Hananasif', postcode: '14110', streets: ['Hananasif Road', 'Kinondoni Road', 'Shekilango Road'] },
          { name: 'Mburahati', postcode: '14111', streets: ['Mburahati Road', 'Morogoro Road', 'Mandela Road'] },
          { name: 'Ubungo', postcode: '14112', streets: ['Morogoro Road', 'Mandela Road', 'Sam Nujoma Road'] },
          { name: 'Makumbusho', postcode: '14113', streets: ['Makumbusho Road', 'Ali Hassan Mwinyi Road', 'Bagamoyo Road'] },
          { name: 'Kigogo', postcode: '14114', streets: ['Kigogo Road', 'Morogoro Road', 'Mandela Road'] },
          { name: 'Mabibo', postcode: '14115', streets: ['Mabibo Road', 'Mandela Road', 'Morogoro Road'] },
          { name: 'Ndugumbi', postcode: '14116', streets: ['Ndugumbi Road', 'Morogoro Road', 'Sam Nujoma Road'] },
          { name: 'Kawe', postcode: '14117', streets: ['Kawe Beach Road', 'Bagamoyo Road', 'New Bagamoyo Road'] },
          { name: 'Kunduchi', postcode: '14118', streets: ['Kunduchi Beach Road', 'Bagamoyo Road', 'Mwai Kibaki Road'] },
          { name: 'Mbezi', postcode: '14119', streets: ['Mbezi Beach Road', 'Sam Nujoma Road', 'Bagamoyo Road', 'Mwai Kibaki Road'] },
          { name: 'Goba', postcode: '14120', streets: ['Goba Road', 'Bagamoyo Road', 'Mwai Kibaki Road'] },
        ]
      },
      {
        name: 'Temeke',
        postcode: '15100',
        coordinates: { lat: -6.8500, lng: 39.2667 },
        wards: [
          { name: 'Temeke', postcode: '15101', streets: ['Temeke Road', 'Kilwa Road', 'Mandela Road', 'Chang\'ombe Road'] },
          { name: 'Mtoni', postcode: '15102', streets: ['Mtoni Road', 'Kilwa Road', 'Mandela Road'] },
          { name: 'Kigamboni', postcode: '15103', streets: ['Kigamboni Road', 'Kilwa Road', 'Ferry Road'] },
          { name: 'Charambe', postcode: '15104', streets: ['Charambe Road', 'Kilwa Road', 'Tandika Road'] },
          { name: 'Chang\'ombe', postcode: '15105', streets: ['Chang\'ombe Road', 'Kilwa Road', 'Keko Road'] },
          { name: 'Kurasini', postcode: '15106', streets: ['Kurasini Road', 'Kilwa Road', 'Port Access Road'] },
          { name: 'Mbagala', postcode: '15107', streets: ['Mbagala Road', 'Kilwa Road', 'Chamazi Road', 'Rangitatu Road'] },
          { name: 'Sandali', postcode: '15108', streets: ['Sandali Road', 'Kilwa Road', 'Mbagala Road'] },
          { name: 'Buza', postcode: '15109', streets: ['Buza Road', 'Kilwa Road', 'Mbagala Road'] },
          { name: 'Keko', postcode: '15110', streets: ['Keko Road', 'Chang\'ombe Road', 'Kilwa Road'] },
          { name: 'Miburani', postcode: '15111', streets: ['Miburani Road', 'Kilwa Road', 'Mbagala Road'] },
          { name: 'Mbagala Kuu', postcode: '15112', streets: ['Mbagala Kuu Road', 'Kilwa Road', 'Chamazi Road'] },
          { name: 'Chamazi', postcode: '15113', streets: ['Chamazi Road', 'Kilwa Road', 'Mbagala Road'] },
          { name: 'Toangoma', postcode: '15114', streets: ['Toangoma Road', 'Kilwa Road'] },
        ]
      },
      {
        name: 'Ubungo',
        postcode: '13100',
        coordinates: { lat: -6.7667, lng: 39.2500 },
        wards: [
          { name: 'Ubungo', postcode: '13101', streets: ['Morogoro Road', 'Mandela Road', 'Sam Nujoma Road', 'Ubungo Plaza'] },
          { name: 'Mburahati', postcode: '13102', streets: ['Mburahati Road', 'Morogoro Road', 'Mandela Road'] },
          { name: 'Makuburi', postcode: '13103', streets: ['Makuburi Road', 'Morogoro Road', 'Mandela Road'] },
          { name: 'Kinondoni', postcode: '13104', streets: ['Kinondoni Road', 'Morogoro Road', 'Ali Hassan Mwinyi Road'] },
          { name: 'Manzese', postcode: '13105', streets: ['Manzese Road', 'Kawawa Road', 'Morogoro Road'] },
          { name: 'Makongo', postcode: '13106', streets: ['Makongo Road', 'Morogoro Road', 'Mandela Road'] },
          { name: 'Saranga', postcode: '13107', streets: ['Saranga Road', 'Morogoro Road', 'Sam Nujoma Road'] },
        ]
      },
      {
        name: 'Kigamboni',
        postcode: '12100',
        coordinates: { lat: -6.8667, lng: 39.2833 },
        wards: [
          { name: 'Kigamboni', postcode: '12101', streets: ['Kigamboni Road', 'Ferry Road', 'Ocean Road', 'Beach Road'] },
          { name: 'Vijibweni', postcode: '12102', streets: ['Vijibweni Road', 'Kigamboni Road', 'Beach Road'] },
          { name: 'Kibada', postcode: '12103', streets: ['Kibada Road', 'Kigamboni Road', 'Mjimwema Road'] },
          { name: 'Somangira', postcode: '12104', streets: ['Somangira Road', 'Kigamboni Road'] },
          { name: 'Tungi', postcode: '12105', streets: ['Tungi Road', 'Kigamboni Road', 'Mjimwema Road'] },
          { name: 'Pembamnazi', postcode: '12106', streets: ['Pembamnazi Road', 'Kigamboni Road'] },
        ]
      }
    ]
  },
  {
    name: 'Arusha',
    postcode: '23000',
    coordinates: { lat: -3.3869, lng: 36.6830 },
    districts: [
      {
        name: 'Arusha City',
        postcode: '23101',
        coordinates: { lat: -3.3869, lng: 36.6830 },
        wards: [
          { name: 'Kaloleni', postcode: '23101', streets: ['Kaloleni Road', 'Sokoine Road', 'Boma Road', 'Market Street'] },
          { name: 'Levolosi', postcode: '23102', streets: ['Levolosi Road', 'Stadium Road', 'Colonel Middleton Road'] },
          { name: 'Themi', postcode: '23103', streets: ['Themi Road', 'Serengeti Road', 'Old Moshi Road'] },
          { name: 'Sekei', postcode: '23104', streets: ['Sekei Road', 'Dodoma Road', 'Makongoro Road'] },
          { name: 'Unga Limited', postcode: '23105', streets: ['Unga Road', 'Industrial Area', 'Dodoma Road'] },
          { name: 'Sokon I', postcode: '23106', streets: ['Sokon Road', 'Makongoro Road', 'Market Road'] },
          { name: 'Ngarenaro', postcode: '23107', streets: ['Ngarenaro Road', 'Serengeti Road', 'Makongoro Road'] },
          { name: 'Moshono', postcode: '23108', streets: ['Moshono Road', 'Old Moshi Road', 'Themi Road'] },
          { name: 'Elerai', postcode: '23109', streets: ['Elerai Road', 'Njiro Road', 'Sakina Road'] },
          { name: 'Sombetini', postcode: '23110', streets: ['Sombetini Road', 'Ngaramtoni Road', 'Lemara Road'] },
        ]
      },
      {
        name: 'Arusha Rural',
        postcode: '23201',
        coordinates: { lat: -3.3500, lng: 36.7000 },
        wards: [
          { name: 'Ngarenanyuki', postcode: '23201', streets: ['Ngarenanyuki Road', 'Meru Road'] },
          { name: 'Oljoro', postcode: '23202', streets: ['Oljoro Road', 'Pastoral Road'] },
          { name: 'Olmotonyi', postcode: '23203', streets: ['Olmotonyi Road', 'Farm Road'] },
          { name: 'Kikwe', postcode: '23204', streets: ['Kikwe Road', 'Village Road'] },
          { name: 'Mateves', postcode: '23205', streets: ['Mateves Road', 'Cattle Track'] },
        ]
      },
      {
        name: 'Karatu',
        postcode: '23301',
        coordinates: { lat: -3.4833, lng: 35.7500 },
        wards: [
          { name: 'Karatu', postcode: '23301', streets: ['Karatu Main Road', 'Ngorongoro Road', 'Market Street'] },
          { name: 'Endabash', postcode: '23302', streets: ['Endabash Road', 'Village Road'] },
          { name: 'Rhotia', postcode: '23303', streets: ['Rhotia Road', 'Coffee Plantation Road'] },
        ]
      },
      {
        name: 'Meru',
        postcode: '23401',
        coordinates: { lat: -3.2833, lng: 36.8167 },
        wards: [
          { name: 'Poli', postcode: '23401', streets: ['Poli Road', 'Meru Slopes'] },
          { name: 'Kingori', postcode: '23402', streets: ['Kingori Road', 'Mountain Road'] },
          { name: 'Nkoaranga', postcode: '23403', streets: ['Nkoaranga Road', 'Hospital Road'] },
        ]
      }
    ]
  },
  {
    name: 'Mwanza',
    postcode: '33000',
    coordinates: { lat: -2.5164, lng: 32.9175 },
    districts: [
      {
        name: 'Ilemela',
        postcode: '33101',
        coordinates: { lat: -2.4667, lng: 32.9167 },
        wards: [
          { name: 'Nyamagana', postcode: '33101', streets: ['Station Road', 'Kenyatta Road', 'Post Street', 'Uhuru Street'] },
          { name: 'Ilemela', postcode: '33102', streets: ['Ilemela Road', 'Capri Point', 'Lake Road'] },
          { name: 'Pasiansi', postcode: '33103', streets: ['Pasiansi Road', 'Mwanza-Shinyanga Road'] },
          { name: 'Buswelu', postcode: '33104', streets: ['Buswelu Road', 'Airport Road'] },
          { name: 'Igoma', postcode: '33105', streets: ['Igoma Road', 'Mwanza-Musoma Road'] },
          { name: 'Bugogwa', postcode: '33106', streets: ['Bugogwa Road', 'Lake View Road'] },
        ]
      },
      {
        name: 'Nyamagana',
        postcode: '33201',
        coordinates: { lat: -2.5167, lng: 32.9000 },
        wards: [
          { name: 'Mahina', postcode: '33201', streets: ['Mahina Road', 'Rock City Avenue', 'Pamba Road'] },
          { name: 'Mirongo', postcode: '33202', streets: ['Mirongo Road', 'Mwanza-Musoma Road'] },
          { name: 'Mwanza Centre', postcode: '33203', streets: ['Balewa Road', 'Nyerere Road', 'Market Street', 'Clock Tower Road'] },
          { name: 'Buhongwa', postcode: '33204', streets: ['Buhongwa Road', 'Industrial Road'] },
          { name: 'Nyakato', postcode: '33205', streets: ['Nyakato Road', 'Mwanza-Shinyanga Road'] },
          { name: 'Mkuyuni', postcode: '33206', streets: ['Mkuyuni Road', 'Cemetery Road'] },
        ]
      }
    ]
  },
  {
    name: 'Dodoma',
    postcode: '41000',
    coordinates: { lat: -6.1630, lng: 35.7516 },
    districts: [
      {
        name: 'Dodoma City',
        postcode: '41101',
        coordinates: { lat: -6.1630, lng: 35.7516 },
        wards: [
          { name: 'Kikuyu', postcode: '41101', streets: ['Kikuyu Road', 'Dodoma-Morogoro Road', 'Bunge Road'] },
          { name: 'Makole', postcode: '41102', streets: ['Makole Road', 'University Road', 'UDOM Road'] },
          { name: 'Nzuguni', postcode: '41103', streets: ['Nzuguni Road', 'Chang\'ombe Road'] },
          { name: 'Zuzu', postcode: '41104', streets: ['Zuzu Road', 'Market Road'] },
          { name: 'Miyuji', postcode: '41105', streets: ['Miyuji Road', 'Dodoma-Iringa Road'] },
          { name: 'Hombolo', postcode: '41106', streets: ['Hombolo Road', 'Airport Road'] },
          { name: 'Ihumwa', postcode: '41107', streets: ['Ihumwa Road', 'Station Road'] },
          { name: 'Ipagala', postcode: '41108', streets: ['Ipagala Road', 'Industrial Area'] },
          { name: 'Hazina', postcode: '41109', streets: ['Hazina Road', 'Parliament Road', 'Government Road'] },
        ]
      }
    ]
  },
  {
    name: 'Mbeya',
    postcode: '53000',
    coordinates: { lat: -8.9094, lng: 33.4606 },
    districts: [
      {
        name: 'Mbeya City',
        postcode: '53101',
        coordinates: { lat: -8.9094, lng: 33.4606 },
        wards: [
          { name: 'Iyunga', postcode: '53101', streets: ['Iyunga Road', 'Mbeya-Tunduma Road', 'Karume Road'] },
          { name: 'Mbalizi', postcode: '53102', streets: ['Mbalizi Road', 'Tazara Road', 'Songwe Road'] },
          { name: 'Itende', postcode: '53103', streets: ['Itende Road', 'Hospital Road', 'Uyole Road'] },
          { name: 'Nsalaga', postcode: '53104', streets: ['Nsalaga Road', 'Market Road'] },
          { name: 'Iganjo', postcode: '53105', streets: ['Iganjo Road', 'Mbeya-Iringa Road'] },
          { name: 'Ruanda', postcode: '53106', streets: ['Ruanda Road', 'Loleza Road'] },
          { name: 'Sisimba', postcode: '53107', streets: ['Sisimba Road', 'Station Road'] },
        ]
      }
    ]
  },
  {
    name: 'Morogoro',
    postcode: '67000',
    coordinates: { lat: -6.8211, lng: 37.6636 },
    districts: [
      {
        name: 'Morogoro Municipal',
        postcode: '67101',
        coordinates: { lat: -6.8211, lng: 37.6636 },
        wards: [
          { name: 'Kihonda', postcode: '67101', streets: ['Kihonda Road', 'Morogoro-Dar Road', 'Old Dar Road'] },
          { name: 'Kilakala', postcode: '67102', streets: ['Kilakala Road', 'SUA Road', 'University Road'] },
          { name: 'Mafisa', postcode: '67103', streets: ['Mafisa Road', 'Station Road', 'Railway Road'] },
          { name: 'Kingolwira', postcode: '67104', streets: ['Kingolwira Road', 'Hospital Road'] },
          { name: 'Mazimbu', postcode: '67105', streets: ['Mazimbu Road', 'SUA Campus Road'] },
          { name: 'Boma', postcode: '67106', streets: ['Boma Road', 'Old Boma Road', 'Market Street'] },
          { name: 'Kichangani', postcode: '67107', streets: ['Kichangani Road', 'Uhuru Street'] },
          { name: 'Bigwa', postcode: '67108', streets: ['Bigwa Road', 'Ring Road'] },
        ]
      }
    ]
  },
  {
    name: 'Tanga',
    postcode: '21000',
    coordinates: { lat: -5.0689, lng: 39.0986 },
    districts: [
      {
        name: 'Tanga City',
        postcode: '21101',
        coordinates: { lat: -5.0689, lng: 39.0986 },
        wards: [
          { name: 'Chumbageni', postcode: '21101', streets: ['Chumbageni Road', 'Market Street', 'Independence Avenue'] },
          { name: 'Makorora', postcode: '21102', streets: ['Makorora Road', 'Tanga-Mombasa Road'] },
          { name: 'Tangasisi', postcode: '21103', streets: ['Tangasisi Road', 'Hospital Road'] },
          { name: 'Ngamiani Kaskazini', postcode: '21104', streets: ['Ngamiani Road', 'Beach Road North'] },
          { name: 'Ngamiani Kusini', postcode: '21105', streets: ['Ngamiani South Road', 'Beach Road South'] },
          { name: 'Mzingani', postcode: '21106', streets: ['Mzingani Road', 'Port Road'] },
          { name: 'Central', postcode: '21107', streets: ['Ocean Road', 'Mkunguni Street', 'Jamhuri Street'] },
        ]
      }
    ]
  },
  {
    name: 'Mtwara',
    postcode: '63000',
    coordinates: { lat: -10.2693, lng: 40.1836 },
    districts: [
      {
        name: 'Mtwara Municipal',
        postcode: '63101',
        coordinates: { lat: -10.2693, lng: 40.1836 },
        wards: [
          { name: 'Shangani', postcode: '63101', streets: ['Shangani Road', 'Aga Khan Road', 'Beach Road'] },
          { name: 'Chikongola', postcode: '63102', streets: ['Chikongola Road', 'Hospital Road'] },
          { name: 'Majengo', postcode: '63103', streets: ['Majengo Road', 'Market Street'] },
          { name: 'Jangwani', postcode: '63104', streets: ['Jangwani Road', 'Station Road'] },
          { name: 'Shauriyako', postcode: '63105', streets: ['Shauriyako Road', 'Uhuru Street'] },
          { name: 'Magomeni', postcode: '63106', streets: ['Magomeni Road', 'Ring Road'] },
        ]
      }
    ]
  }
];

// Helper function to get all regions
export const getRegions = (): Region[] => {
  return tanzaniaLocations;
};

// Helper function to get districts for a region
export const getDistrictsByRegion = (regionName: string): District[] => {
  const region = tanzaniaLocations.find(r => r.name === regionName);
  return region?.districts || [];
};

// Helper function to get wards for a district
export const getWardsByDistrict = (regionName: string, districtName: string): Ward[] => {
  const region = tanzaniaLocations.find(r => r.name === regionName);
  const district = region?.districts.find(d => d.name === districtName);
  return district?.wards || [];
};

// Helper function to get coordinates for a location
export const getCoordinates = (regionName: string, districtName?: string): { lat: number; lng: number } => {
  const region = tanzaniaLocations.find(r => r.name === regionName);
  if (!region) return { lat: -6.7924, lng: 39.2083 }; // Default to Dar es Salaam
  
  if (districtName) {
    const district = region.districts.find(d => d.name === districtName);
    return district?.coordinates || region.coordinates || { lat: -6.7924, lng: 39.2083 };
  }
  
  return region.coordinates || { lat: -6.7924, lng: 39.2083 };
};
