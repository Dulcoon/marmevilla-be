const fs = require('fs');

const MATERIAL_ICONS = ["wifi","pool","ac_unit","kitchen","restaurant","tv","hot_tub","local_parking","sports_tennis","spa","water_drop","coffee_maker","local_drink","lock","checkroom","flight","fitness_center","event_busy","calendar_month","delete","calendar_today","check_circle","error","search","close","inbox","chevron_right","arrow_back","person","receipt","history_edu","payments","edit_note","warning","timeline","visibility","visibility_off","delete_forever","add","trending_up","villa","menu","notifications","mail","logout","hotel","king_bed","single_bed","bathtub","shower","directions_car","directions_bike","local_airport","beach_access","local_dining","local_cafe","local_bar","room_service","cleaning_services","dry_cleaning","local_laundry_service","iron","microwave","blender","coffee","wine_bar","smoking_rooms","smoke_free","pets","child_friendly","family_restroom","accessible","elevator","stairs","balcony","deck","outdoor_grill","fireplace","fire_extinguisher","medical_services","local_hospital","local_pharmacy","local_police","directions_transit","directions_bus","directions_railway","local_taxi","map","location_on","near_me","explore","terrain","park","forest","nature","nature_people","landscape","sunny","wb_sunny","nights_stay","star","star_half","star_outline","reviews","rate_review","thumb_up","thumb_down","favorite","favorite_border","share","send","chat","forum","phone","call","email","contact_support","help","info","settings","build","tune","sort","filter_list","more_vert","more_horiz","apps","grid_view","list","view_list","view_module","view_quilt","dashboard","home","work","school","store","business","apartment","house","cottage","cabin","chalet","bungalow","gite","holiday_village","car_rental","directions_boat","flight_takeoff","flight_land","luggage","no_luggage","airplane_ticket","confirmation_number","receipt_long","article","description","assignment","event","date_range","schedule","watch_later","timer","alarm","alarm_on","alarm_off","snooze","lightbulb","highlight","wb_incandescent","flare","flash_on","flash_off","flash_auto","camera_alt","photo_camera","videocam","mic","volume_up","volume_down","volume_mute","volume_off","play_arrow","pause","stop","fast_forward","fast_rewind","skip_next","skip_previous","shuffle","repeat","music_note","library_music","movie","local_movies","theaters","ondemand_video","tv_off","computer","laptop","smartphone","tablet","watch","desktop_mac","desktop_windows","mouse","keyboard","speaker","headset","headset_mic","router","cast","cast_connected","airplay","print","picture_as_pdf","folder","folder_open","cloud","cloud_upload","cloud_download","cloud_done","backup","sync","sync_problem","autorenew","refresh","update","loop","undo","redo","reply","reply_all","forward","archive","unarchive","delete_outline","save","save_alt","file_download","file_upload","attachment","link","add_link","insert_link","insert_photo","insert_drive_file","insert_chart","insert_emoticon","emoji_emotions","mood","mood_bad","sentiment_satisfied","sentiment_dissatisfied","sentiment_very_satisfied","sentiment_very_dissatisfied", "check_circle"];

const uniqueIcons = [...new Set(MATERIAL_ICONS)];

function toPascalCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

let imports = [];
let mappings = [];

uniqueIcons.forEach(icon => {
    let pascal = 'Md' + toPascalCase(icon);
    imports.push(pascal);
    mappings.push(`  '${icon}': ${pascal},`);
});

const fileContentJSX = `import React from 'react';
import {
  ${imports.join(',\n  ')}
} from 'react-icons/md';

export const iconMap = {
${mappings.join('\n')}
};

export const IconRenderer = ({ name, className = '', ...props }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return <MdCheckCircle className={className} {...props} />;
  }

  return <IconComponent className={className} {...props} />;
};

export const AVAILABLE_ICONS = Object.keys(iconMap);
`;

const fileContentTSX = `import React from 'react';
import { IconType } from 'react-icons';
import {
  ${imports.join(',\n  ')}
} from 'react-icons/md';

export const iconMap: Record<string, IconType> = {
${mappings.join('\n')}
};

export const IconRenderer = ({ name, className = '', ...props }: { name: string, className?: string, [key: string]: any }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return <MdCheckCircle className={className} {...props} />;
  }

  return <IconComponent className={className} {...props} />;
};

export const AVAILABLE_ICONS = Object.keys(iconMap);
`;

fs.writeFileSync('resources/js/utils/icon-mapper.jsx', fileContentJSX);
console.log('icon-mapper.jsx generated in marmevilla-BE with ' + uniqueIcons.length + ' icons.');

// also copy to FE
const fePath = '../javanese-villa-escapes/src/utils';
if (!fs.existsSync(fePath)){
    fs.mkdirSync(fePath, { recursive: true });
}
fs.writeFileSync(fePath + '/icon-mapper.tsx', fileContentTSX);
console.log('icon-mapper.tsx generated in javanese-villa-escapes.');

