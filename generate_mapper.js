const fs = require('fs');

const MATERIAL_ICONS = ["wifi","pool","ac_unit","kitchen","restaurant","tv","hot_tub","local_parking","sports_tennis","spa","water_drop","coffee_maker","local_drink","lock","checkroom","flight","fitness_center","event_busy","calendar_month","delete","calendar_today","check_circle","error","search","close","inbox","chevron_right","arrow_back","person","receipt","history_edu","payments","edit_note","warning","timeline","visibility","visibility_off","delete_forever","add","trending_up","villa","menu","notifications","mail","logout","hotel","king_bed","single_bed","bathtub","shower","directions_car","directions_bike","local_airport","beach_access","local_dining","local_cafe","local_bar","room_service","cleaning_services","dry_cleaning","local_laundry_service","iron","ironing","ironing_board","hair_dryer","microwave","oven","refrigerator","blender","toaster","coffee","tea","wine_bar","smoking_rooms","smoke_free","pets","no_pets","child_friendly","family_restroom","accessible","elevator","stairs","balcony","deck","patio","outdoor_grill","fireplace","fire_extinguisher","first_aid","medical_services","local_hospital","local_pharmacy","local_police","directions_transit","directions_bus","directions_railway","local_taxi","map","location_on","near_me","explore","terrain","park","forest","nature","nature_people","landscape","sunny","wb_sunny","nights_stay","star","star_half","star_outline","reviews","rate_review","thumb_up","thumb_down","favorite","favorite_border","share","send","chat","forum","phone","call","email","contact_support","help","info","settings","build","tune","sort","filter_list","more_vert","more_horiz","apps","grid_view","list","view_list","view_module","view_quilt","dashboard","home","work","school","store","business","apartment","house","cottage","cabin","chalet","bungalow","gite","holiday_village","camping","tent","car_rental","directions_boat","flight_takeoff","flight_land","luggage","no_luggage","airplane_ticket","confirmation_number","receipt_long","article","description","assignment","event","date_range","schedule","watch_later","timer","alarm","alarm_on","alarm_off","snooze","lightbulb","highlight","wb_incandescent","flare","flash_on","flash_off","flash_auto","camera_alt","photo_camera","videocam","mic","volume_up","volume_down","volume_mute","volume_off","play_arrow","pause","stop","fast_forward","fast_rewind","skip_next","skip_previous","shuffle","repeat","music_note","library_music","movie","local_movies","theaters","ondemand_video","tv_off","computer","laptop","smartphone","tablet","watch","desktop_mac","desktop_windows","mouse","keyboard","speaker","headset","headset_mic","router","cast","cast_connected","airplay","print","scan","picture_as_pdf","folder","folder_open","cloud","cloud_upload","cloud_download","cloud_done","backup","sync","sync_problem","autorenew","refresh","update","loop","undo","redo","reply","reply_all","forward","archive","unarchive","delete_outline","save","save_alt","file_download","file_upload","attachment","link","add_link","insert_link","insert_photo","insert_drive_file","insert_chart","insert_emoticon","emoji_emotions","mood","mood_bad","sentiment_satisfied","sentiment_dissatisfied","sentiment_very_satisfied","sentiment_very_dissatisfied"];

// Ensure unique
const uniqueIcons = [...new Set(MATERIAL_ICONS)];

function toPascalCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

let imports = [];
let mappings = [];

uniqueIcons.forEach(icon => {
    let pascal = 'Md' + toPascalCase(icon);
    // Special handling for numbers or reserved keywords if any
    if (/^[0-9]/.test(pascal)) {
        // react-icons usually prefixes with Md if it starts with number, e.g. 10k -> Md10K
        // this can be tricky, so let's stick to non-number icons.
        pascal = pascal.replace(/^Md([0-9])(.*)/, 'Md$1$2'); // It's just a guess, we might get build errors
    }
    
    imports.push(pascal);
    mappings.push(`  '${icon}': ${pascal},`);
});

const fileContent = `import React from 'react';
import {
  ${imports.join(',\n  ')}
} from 'react-icons/md';
import { MdCheckCircle } from 'react-icons/md';

export const iconMap = {
${mappings.join('\n')}
};

export const IconRenderer = ({ name, className, ...props }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Fallback icon if the requested one isn't in our curated list
    return <MdCheckCircle className={className} {...props} />;
  }

  return <IconComponent className={className} {...props} />;
};

export const AVAILABLE_ICONS = Object.keys(iconMap);
`;

fs.writeFileSync('icon-mapper.jsx', fileContent);
console.log('icon-mapper.jsx generated with ' + uniqueIcons.length + ' icons.');
