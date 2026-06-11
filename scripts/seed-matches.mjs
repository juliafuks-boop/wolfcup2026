/**
 * seed-matches.mjs
 * One-time script: seeds the matches table from the fixture list.
 * Run:  node scripts/seed-matches.mjs
 * Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MATCHES = [
  // ── GROUP A ──
  {id:'m1',  round:'group',group:'A',matchday:1, homeName:'Mexico',       homeFlag:'🇲🇽',homeCode:'MEX', awayName:'South Africa',    awayFlag:'🇿🇦',awayCode:'RSA', stadium:'Estadio Azteca',         city:'Mexico City',       dateLabel:'Jun 11',time:'15:00'},
  {id:'m2',  round:'group',group:'A',matchday:1, homeName:'South Korea',  homeFlag:'🇰🇷',homeCode:'KOR', awayName:'Czechia',          awayFlag:'🇨🇿',awayCode:'CZE', stadium:'Mercedes-Benz Stadium',  city:'Atlanta',           dateLabel:'Jun 12',time:'15:00'},
  {id:'m3',  round:'group',group:'A',matchday:2, homeName:'Mexico',       homeFlag:'🇲🇽',homeCode:'MEX', awayName:'South Korea',      awayFlag:'🇰🇷',awayCode:'KOR', stadium:'Estadio Akron',           city:'Guadalajara',       dateLabel:'Jun 19',time:'18:00'},
  {id:'m4',  round:'group',group:'A',matchday:2, homeName:'South Africa', homeFlag:'🇿🇦',homeCode:'RSA', awayName:'Czechia',          awayFlag:'🇨🇿',awayCode:'CZE', stadium:'Estadio BBVA',            city:'Monterrey',         dateLabel:'Jun 20',time:'15:00'},
  {id:'m5',  round:'group',group:'A',matchday:3, homeName:'Mexico',       homeFlag:'🇲🇽',homeCode:'MEX', awayName:'Czechia',          awayFlag:'🇨🇿',awayCode:'CZE', stadium:'Estadio BBVA',            city:'Monterrey',         dateLabel:'Jun 25',time:'15:00'},
  {id:'m6',  round:'group',group:'A',matchday:3, homeName:'South Africa', homeFlag:'🇿🇦',homeCode:'RSA', awayName:'South Korea',      awayFlag:'🇰🇷',awayCode:'KOR', stadium:'Estadio Akron',           city:'Guadalajara',       dateLabel:'Jun 25',time:'15:00'},
  // ── GROUP B ──
  {id:'m7',  round:'group',group:'B',matchday:1, homeName:'Canada',       homeFlag:'🇨🇦',homeCode:'CAN', awayName:'Bosnia & Herzegovina',awayFlag:'🇧🇦',awayCode:'BIH',stadium:'BMO Field',             city:'Toronto',           dateLabel:'Jun 12',time:'18:00'},
  {id:'m8',  round:'group',group:'B',matchday:1, homeName:'Qatar',        homeFlag:'🇶🇦',homeCode:'QAT', awayName:'Switzerland',      awayFlag:'🇨🇭',awayCode:'SUI', stadium:'Lumen Field',             city:'Seattle',           dateLabel:'Jun 13',time:'15:00'},
  {id:'m9',  round:'group',group:'B',matchday:2, homeName:'Canada',       homeFlag:'🇨🇦',homeCode:'CAN', awayName:'Qatar',            awayFlag:'🇶🇦',awayCode:'QAT', stadium:'BC Place',                city:'Vancouver',         dateLabel:'Jun 20',time:'18:00'},
  {id:'m10', round:'group',group:'B',matchday:2, homeName:'Bosnia & Herzegovina',homeFlag:'🇧🇦',homeCode:'BIH',awayName:'Switzerland',awayFlag:'🇨🇭',awayCode:'SUI',stadium:'Hard Rock Stadium',      city:'Miami',             dateLabel:'Jun 20',time:'21:00'},
  {id:'m11', round:'group',group:'B',matchday:3, homeName:'Canada',       homeFlag:'🇨🇦',homeCode:'CAN', awayName:'Switzerland',      awayFlag:'🇨🇭',awayCode:'SUI', stadium:'BMO Field',               city:'Toronto',           dateLabel:'Jun 25',time:'18:00'},
  {id:'m12', round:'group',group:'B',matchday:3, homeName:'Bosnia & Herzegovina',homeFlag:'🇧🇦',homeCode:'BIH',awayName:'Qatar',     awayFlag:'🇶🇦',awayCode:'QAT', stadium:'Lumen Field',             city:'Seattle',           dateLabel:'Jun 25',time:'18:00'},
  // ── GROUP C ──
  {id:'m13', round:'group',group:'C',matchday:1, homeName:'Brazil',       homeFlag:'🇧🇷',homeCode:'BRA', awayName:'Morocco',          awayFlag:'🇲🇦',awayCode:'MAR', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 13',time:'18:00'},
  {id:'m14', round:'group',group:'C',matchday:1, homeName:'Haiti',        homeFlag:'🇭🇹',homeCode:'HAI', awayName:'Scotland',         awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',awayCode:'SCO',stadium:'Lincoln Financial Field',city:'Philadelphia',      dateLabel:'Jun 14',time:'15:00'},
  {id:'m15', round:'group',group:'C',matchday:2, homeName:'Brazil',       homeFlag:'🇧🇷',homeCode:'BRA', awayName:'Haiti',            awayFlag:'🇭🇹',awayCode:'HAI', stadium:'Hard Rock Stadium',       city:'Miami',             dateLabel:'Jun 21',time:'15:00'},
  {id:'m16', round:'group',group:'C',matchday:2, homeName:'Morocco',      homeFlag:'🇲🇦',homeCode:'MAR', awayName:'Scotland',         awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',awayCode:'SCO',stadium:'MetLife Stadium',       city:'East Rutherford',   dateLabel:'Jun 21',time:'18:00'},
  {id:'m17', round:'group',group:'C',matchday:3, homeName:'Brazil',       homeFlag:'🇧🇷',homeCode:'BRA', awayName:'Scotland',         awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',awayCode:'SCO',stadium:'Lincoln Financial Field',city:'Philadelphia',      dateLabel:'Jun 26',time:'18:00'},
  {id:'m18', round:'group',group:'C',matchday:3, homeName:'Morocco',      homeFlag:'🇲🇦',homeCode:'MAR', awayName:'Haiti',            awayFlag:'🇭🇹',awayCode:'HAI', stadium:'Hard Rock Stadium',       city:'Miami',             dateLabel:'Jun 26',time:'18:00'},
  // ── GROUP D ──
  {id:'m19', round:'group',group:'D',matchday:1, homeName:'USA',          homeFlag:'🇺🇸',homeCode:'USA', awayName:'Paraguay',         awayFlag:'🇵🇾',awayCode:'PAR', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 14',time:'18:00'},
  {id:'m20', round:'group',group:'D',matchday:1, homeName:'Australia',    homeFlag:'🇦🇺',homeCode:'AUS', awayName:'Türkiye',          awayFlag:'🇹🇷',awayCode:'TUR', stadium:'BC Place',                city:'Vancouver',         dateLabel:'Jun 14',time:'21:00'},
  {id:'m21', round:'group',group:'D',matchday:2, homeName:'USA',          homeFlag:'🇺🇸',homeCode:'USA', awayName:'Australia',        awayFlag:'🇦🇺',awayCode:'AUS', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 22',time:'18:00'},
  {id:'m22', round:'group',group:'D',matchday:2, homeName:'Paraguay',     homeFlag:'🇵🇾',homeCode:'PAR', awayName:'Türkiye',          awayFlag:'🇹🇷',awayCode:'TUR', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 22',time:'21:00'},
  {id:'m23', round:'group',group:'D',matchday:3, homeName:'USA',          homeFlag:'🇺🇸',homeCode:'USA', awayName:'Türkiye',          awayFlag:'🇹🇷',awayCode:'TUR', stadium:'Arrowhead Stadium',       city:'Kansas City',       dateLabel:'Jun 26',time:'21:00'},
  {id:'m24', round:'group',group:'D',matchday:3, homeName:'Paraguay',     homeFlag:'🇵🇾',homeCode:'PAR', awayName:'Australia',        awayFlag:'🇦🇺',awayCode:'AUS', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 26',time:'21:00'},
  // ── GROUP E ──
  {id:'m25', round:'group',group:'E',matchday:1, homeName:'Germany',      homeFlag:'🇩🇪',homeCode:'GER', awayName:'Curaçao',          awayFlag:'🇨🇼',awayCode:'CUW', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 15',time:'21:00'},
  {id:'m26', round:'group',group:'E',matchday:1, homeName:"Côte d'Ivoire",homeFlag:'🇨🇮',homeCode:'CIV', awayName:'Ecuador',          awayFlag:'🇪🇨',awayCode:'ECU', stadium:'Mercedes-Benz Stadium',  city:'Atlanta',           dateLabel:'Jun 16',time:'18:00'},
  {id:'m27', round:'group',group:'E',matchday:2, homeName:'Germany',      homeFlag:'🇩🇪',homeCode:'GER', awayName:"Côte d'Ivoire",    awayFlag:'🇨🇮',awayCode:'CIV', stadium:'Mercedes-Benz Stadium',  city:'Atlanta',           dateLabel:'Jun 23',time:'18:00'},
  {id:'m28', round:'group',group:'E',matchday:2, homeName:'Curaçao',      homeFlag:'🇨🇼',homeCode:'CUW', awayName:'Ecuador',          awayFlag:'🇪🇨',awayCode:'ECU', stadium:'Gillette Stadium',        city:'Boston',            dateLabel:'Jun 24',time:'15:00'},
  {id:'m29', round:'group',group:'E',matchday:3, homeName:'Germany',      homeFlag:'🇩🇪',homeCode:'GER', awayName:'Ecuador',          awayFlag:'🇪🇨',awayCode:'ECU', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 28',time:'21:00'},
  {id:'m30', round:'group',group:'E',matchday:3, homeName:'Curaçao',      homeFlag:'🇨🇼',homeCode:'CUW', awayName:"Côte d'Ivoire",    awayFlag:'🇨🇮',awayCode:'CIV', stadium:'Gillette Stadium',        city:'Boston',            dateLabel:'Jun 28',time:'21:00'},
  // ── GROUP F ──
  {id:'m31', round:'group',group:'F',matchday:1, homeName:'Netherlands',  homeFlag:'🇳🇱',homeCode:'NED', awayName:'Japan',            awayFlag:'🇯🇵',awayCode:'JPN', stadium:'Lumen Field',             city:'Seattle',           dateLabel:'Jun 16',time:'21:00'},
  {id:'m32', round:'group',group:'F',matchday:1, homeName:'Tunisia',      homeFlag:'🇹🇳',homeCode:'TUN', awayName:'Sweden',           awayFlag:'🇸🇪',awayCode:'SWE', stadium:"Levi's Stadium",          city:'San Jose',          dateLabel:'Jun 17',time:'15:00'},
  {id:'m33', round:'group',group:'F',matchday:2, homeName:'Netherlands',  homeFlag:'🇳🇱',homeCode:'NED', awayName:'Tunisia',          awayFlag:'🇹🇳',awayCode:'TUN', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 24',time:'21:00'},
  {id:'m34', round:'group',group:'F',matchday:2, homeName:'Japan',        homeFlag:'🇯🇵',homeCode:'JPN', awayName:'Sweden',           awayFlag:'🇸🇪',awayCode:'SWE', stadium:'Lumen Field',             city:'Seattle',           dateLabel:'Jun 25',time:'21:00'},
  {id:'m35', round:'group',group:'F',matchday:3, homeName:'Netherlands',  homeFlag:'🇳🇱',homeCode:'NED', awayName:'Sweden',           awayFlag:'🇸🇪',awayCode:'SWE', stadium:"Levi's Stadium",          city:'San Jose',          dateLabel:'Jun 29',time:'21:00'},
  {id:'m36', round:'group',group:'F',matchday:3, homeName:'Tunisia',      homeFlag:'🇹🇳',homeCode:'TUN', awayName:'Japan',            awayFlag:'🇯🇵',awayCode:'JPN', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 29',time:'21:00'},
  // ── GROUP G ──
  {id:'m37', round:'group',group:'G',matchday:1, homeName:'Belgium',      homeFlag:'🇧🇪',homeCode:'BEL', awayName:'Egypt',            awayFlag:'🇪🇬',awayCode:'EGY', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 17',time:'18:00'},
  {id:'m38', round:'group',group:'G',matchday:1, homeName:'Iran',         homeFlag:'🇮🇷',homeCode:'IRN', awayName:'New Zealand',      awayFlag:'🇳🇿',awayCode:'NZL', stadium:"Levi's Stadium",          city:'San Jose',          dateLabel:'Jun 18',time:'15:00'},
  {id:'m39', round:'group',group:'G',matchday:2, homeName:'Belgium',      homeFlag:'🇧🇪',homeCode:'BEL', awayName:'Iran',             awayFlag:'🇮🇷',awayCode:'IRN', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 25',time:'15:00'},
  {id:'m40', round:'group',group:'G',matchday:2, homeName:'Egypt',        homeFlag:'🇪🇬',homeCode:'EGY', awayName:'New Zealand',      awayFlag:'🇳🇿',awayCode:'NZL', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 26',time:'15:00'},
  {id:'m41', round:'group',group:'G',matchday:3, homeName:'Belgium',      homeFlag:'🇧🇪',homeCode:'BEL', awayName:'New Zealand',      awayFlag:'🇳🇿',awayCode:'NZL', stadium:"Levi's Stadium",          city:'San Jose',          dateLabel:'Jun 30',time:'21:00'},
  {id:'m42', round:'group',group:'G',matchday:3, homeName:'Egypt',        homeFlag:'🇪🇬',homeCode:'EGY', awayName:'Iran',             awayFlag:'🇮🇷',awayCode:'IRN', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 30',time:'21:00'},
  // ── GROUP H ──
  {id:'m43', round:'group',group:'H',matchday:1, homeName:'Spain',        homeFlag:'🇪🇸',homeCode:'ESP', awayName:'Cabo Verde',       awayFlag:'🇨🇻',awayCode:'CPV', stadium:'Hard Rock Stadium',       city:'Miami',             dateLabel:'Jun 18',time:'18:00'},
  {id:'m44', round:'group',group:'H',matchday:1, homeName:'Saudi Arabia', homeFlag:'🇸🇦',homeCode:'KSA', awayName:'Uruguay',          awayFlag:'🇺🇾',awayCode:'URU', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 18',time:'21:00'},
  {id:'m45', round:'group',group:'H',matchday:2, homeName:'Spain',        homeFlag:'🇪🇸',homeCode:'ESP', awayName:'Saudi Arabia',     awayFlag:'🇸🇦',awayCode:'KSA', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 26',time:'18:00'},
  {id:'m46', round:'group',group:'H',matchday:2, homeName:'Cabo Verde',   homeFlag:'🇨🇻',homeCode:'CPV', awayName:'Uruguay',          awayFlag:'🇺🇾',awayCode:'URU', stadium:'Arrowhead Stadium',       city:'Kansas City',       dateLabel:'Jun 26',time:'15:00'},
  {id:'m47', round:'group',group:'H',matchday:3, homeName:'Spain',        homeFlag:'🇪🇸',homeCode:'ESP', awayName:'Uruguay',          awayFlag:'🇺🇾',awayCode:'URU', stadium:'Hard Rock Stadium',       city:'Miami',             dateLabel:'Jun 30',time:'18:00'},
  {id:'m48', round:'group',group:'H',matchday:3, homeName:'Cabo Verde',   homeFlag:'🇨🇻',homeCode:'CPV', awayName:'Saudi Arabia',     awayFlag:'🇸🇦',awayCode:'KSA', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 30',time:'18:00'},
  // ── GROUP I ──
  {id:'m49', round:'group',group:'I',matchday:1, homeName:'France',       homeFlag:'🇫🇷',homeCode:'FRA', awayName:'Senegal',          awayFlag:'🇸🇳',awayCode:'SEN', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 19',time:'21:00'},
  {id:'m50', round:'group',group:'I',matchday:1, homeName:'Norway',       homeFlag:'🇳🇴',homeCode:'NOR', awayName:'Iraq',             awayFlag:'🇮🇶',awayCode:'IRQ', stadium:'Gillette Stadium',        city:'Boston',            dateLabel:'Jun 19',time:'18:00'},
  {id:'m51', round:'group',group:'I',matchday:2, homeName:'France',       homeFlag:'🇫🇷',homeCode:'FRA', awayName:'Norway',           awayFlag:'🇳🇴',awayCode:'NOR', stadium:'Lincoln Financial Field', city:'Philadelphia',      dateLabel:'Jun 27',time:'18:00'},
  {id:'m52', round:'group',group:'I',matchday:2, homeName:'Senegal',      homeFlag:'🇸🇳',homeCode:'SEN', awayName:'Iraq',             awayFlag:'🇮🇶',awayCode:'IRQ', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 27',time:'15:00'},
  {id:'m53', round:'group',group:'I',matchday:3, homeName:'France',       homeFlag:'🇫🇷',homeCode:'FRA', awayName:'Iraq',             awayFlag:'🇮🇶',awayCode:'IRQ', stadium:'Gillette Stadium',        city:'Boston',            dateLabel:'Jul 2', time:'15:00'},
  {id:'m54', round:'group',group:'I',matchday:3, homeName:'Norway',       homeFlag:'🇳🇴',homeCode:'NOR', awayName:'Senegal',          awayFlag:'🇸🇳',awayCode:'SEN', stadium:'Lincoln Financial Field', city:'Philadelphia',      dateLabel:'Jul 2', time:'15:00'},
  // ── GROUP J ──
  {id:'m55', round:'group',group:'J',matchday:1, homeName:'Argentina',    homeFlag:'🇦🇷',homeCode:'ARG', awayName:'Algeria',          awayFlag:'🇩🇿',awayCode:'ALG', stadium:'Hard Rock Stadium',       city:'Miami',             dateLabel:'Jun 20',time:'21:00'},
  {id:'m56', round:'group',group:'J',matchday:1, homeName:'Austria',      homeFlag:'🇦🇹',homeCode:'AUT', awayName:'Jordan',           awayFlag:'🇯🇴',awayCode:'JOR', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 20',time:'18:00'},
  {id:'m57', round:'group',group:'J',matchday:2, homeName:'Argentina',    homeFlag:'🇦🇷',homeCode:'ARG', awayName:'Austria',          awayFlag:'🇦🇹',awayCode:'AUT', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 28',time:'18:00'},
  {id:'m58', round:'group',group:'J',matchday:2, homeName:'Algeria',      homeFlag:'🇩🇿',homeCode:'ALG', awayName:'Jordan',           awayFlag:'🇯🇴',awayCode:'JOR', stadium:'Mercedes-Benz Stadium',  city:'Atlanta',           dateLabel:'Jun 28',time:'15:00'},
  {id:'m59', round:'group',group:'J',matchday:3, homeName:'Argentina',    homeFlag:'🇦🇷',homeCode:'ARG', awayName:'Jordan',           awayFlag:'🇯🇴',awayCode:'JOR', stadium:'Hard Rock Stadium',       city:'Miami',             dateLabel:'Jul 2', time:'21:00'},
  {id:'m60', round:'group',group:'J',matchday:3, homeName:'Algeria',      homeFlag:'🇩🇿',homeCode:'ALG', awayName:'Austria',          awayFlag:'🇦🇹',awayCode:'AUT', stadium:'Mercedes-Benz Stadium',  city:'Atlanta',           dateLabel:'Jul 2', time:'21:00'},
  // ── GROUP K ──
  {id:'m61', round:'group',group:'K',matchday:1, homeName:'Portugal',     homeFlag:'🇵🇹',homeCode:'POR', awayName:'Uzbekistan',       awayFlag:'🇺🇿',awayCode:'UZB', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 21',time:'21:00'},
  {id:'m62', round:'group',group:'K',matchday:1, homeName:'Colombia',     homeFlag:'🇨🇴',homeCode:'COL', awayName:'Congo DR',         awayFlag:'🇨🇩',awayCode:'COD', stadium:'Lumen Field',             city:'Seattle',           dateLabel:'Jun 21',time:'18:00'},
  {id:'m63', round:'group',group:'K',matchday:2, homeName:'Portugal',     homeFlag:'🇵🇹',homeCode:'POR', awayName:'Colombia',         awayFlag:'🇨🇴',awayCode:'COL', stadium:'BC Place',                city:'Vancouver',         dateLabel:'Jun 29',time:'21:00'},
  {id:'m64', round:'group',group:'K',matchday:2, homeName:'Uzbekistan',   homeFlag:'🇺🇿',homeCode:'UZB', awayName:'Congo DR',         awayFlag:'🇨🇩',awayCode:'COD', stadium:'SoFi Stadium',            city:'Los Angeles',       dateLabel:'Jun 29',time:'18:00'},
  {id:'m65', round:'group',group:'K',matchday:3, homeName:'Portugal',     homeFlag:'🇵🇹',homeCode:'POR', awayName:'Congo DR',         awayFlag:'🇨🇩',awayCode:'COD', stadium:'Lumen Field',             city:'Seattle',           dateLabel:'Jul 3', time:'21:00'},
  {id:'m66', round:'group',group:'K',matchday:3, homeName:'Uzbekistan',   homeFlag:'🇺🇿',homeCode:'UZB', awayName:'Colombia',         awayFlag:'🇨🇴',awayCode:'COL', stadium:'BC Place',                city:'Vancouver',         dateLabel:'Jul 3', time:'21:00'},
  // ── GROUP L ──
  {id:'m67', round:'group',group:'L',matchday:1, homeName:'England',      homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',homeCode:'ENG',awayName:'Croatia',         awayFlag:'🇭🇷',awayCode:'CRO', stadium:'AT&T Stadium',            city:'Dallas',            dateLabel:'Jun 17',time:'21:00'},
  {id:'m68', round:'group',group:'L',matchday:1, homeName:'Ghana',        homeFlag:'🇬🇭',homeCode:'GHA', awayName:'Panama',           awayFlag:'🇵🇦',awayCode:'PAN', stadium:'Gillette Stadium',        city:'Boston',            dateLabel:'Jun 17',time:'18:00'},
  {id:'m69', round:'group',group:'L',matchday:2, homeName:'England',      homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',homeCode:'ENG',awayName:'Ghana',           awayFlag:'🇬🇭',awayCode:'GHA', stadium:'BMO Field',               city:'Toronto',           dateLabel:'Jun 23',time:'21:00'},
  {id:'m70', round:'group',group:'L',matchday:2, homeName:'Croatia',      homeFlag:'🇭🇷',homeCode:'CRO', awayName:'Panama',           awayFlag:'🇵🇦',awayCode:'PAN', stadium:'MetLife Stadium',         city:'East Rutherford',   dateLabel:'Jun 23',time:'18:00'},
  {id:'m71', round:'group',group:'L',matchday:3, homeName:'England',      homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',homeCode:'ENG',awayName:'Panama',          awayFlag:'🇵🇦',awayCode:'PAN', stadium:'Lincoln Financial Field', city:'Philadelphia',      dateLabel:'Jun 27',time:'21:00'},
  {id:'m72', round:'group',group:'L',matchday:3, homeName:'Croatia',      homeFlag:'🇭🇷',homeCode:'CRO', awayName:'Ghana',            awayFlag:'🇬🇭',awayCode:'GHA', stadium:'BMO Field',               city:'Toronto',           dateLabel:'Jun 27',time:'21:00'},
  // ── ROUND OF 32 ──
  {id:'m73', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'SoFi Stadium',            city:'Los Angeles',   dateLabel:'Jul 4', time:'18:00'},
  {id:'m74', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'MetLife Stadium',         city:'East Rutherford',dateLabel:'Jul 4',time:'21:00'},
  {id:'m75', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'AT&T Stadium',            city:'Dallas',         dateLabel:'Jul 4', time:'15:00'},
  {id:'m76', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Gillette Stadium',        city:'Boston',         dateLabel:'Jul 5', time:'18:00'},
  {id:'m77', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Hard Rock Stadium',       city:'Miami',          dateLabel:'Jul 5', time:'15:00'},
  {id:'m78', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Lumen Field',             city:'Seattle',        dateLabel:'Jul 5', time:'21:00'},
  {id:'m79', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Mercedes-Benz Stadium',  city:'Atlanta',        dateLabel:'Jul 6', time:'18:00'},
  {id:'m80', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Lincoln Financial Field',city:'Philadelphia',   dateLabel:'Jul 6', time:'15:00'},
  {id:'m81', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'BC Place',                city:'Vancouver',      dateLabel:'Jul 6', time:'21:00'},
  {id:'m82', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'BMO Field',               city:'Toronto',        dateLabel:'Jul 7', time:'15:00'},
  {id:'m83', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Estadio Azteca',         city:'Mexico City',    dateLabel:'Jul 7', time:'18:00'},
  {id:'m84', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Arrowhead Stadium',       city:'Kansas City',    dateLabel:'Jul 7', time:'21:00'},
  {id:'m85', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:"Levi's Stadium",          city:'San Jose',       dateLabel:'Jul 7', time:'15:00'},
  {id:'m86', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'SoFi Stadium',            city:'Los Angeles',    dateLabel:'Jul 7', time:'21:00'},
  {id:'m87', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Estadio Akron',           city:'Guadalajara',    dateLabel:'Jul 7', time:'18:00'},
  {id:'m88', round:'r32',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Estadio BBVA',            city:'Monterrey',      dateLabel:'Jul 7', time:'15:00'},
  // ── ROUND OF 16 ──
  {id:'m89', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'MetLife Stadium',         city:'East Rutherford',dateLabel:'Jul 9', time:'21:00'},
  {id:'m90', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'AT&T Stadium',            city:'Dallas',         dateLabel:'Jul 9', time:'18:00'},
  {id:'m91', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'SoFi Stadium',            city:'Los Angeles',    dateLabel:'Jul 10',time:'21:00'},
  {id:'m92', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Hard Rock Stadium',       city:'Miami',          dateLabel:'Jul 10',time:'18:00'},
  {id:'m93', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Gillette Stadium',        city:'Boston',         dateLabel:'Jul 11',time:'21:00'},
  {id:'m94', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Lumen Field',             city:'Seattle',        dateLabel:'Jul 11',time:'18:00'},
  {id:'m95', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Mercedes-Benz Stadium',  city:'Atlanta',        dateLabel:'Jul 12',time:'21:00'},
  {id:'m96', round:'r16',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Lincoln Financial Field',city:'Philadelphia',   dateLabel:'Jul 12',time:'18:00'},
  // ── QUARTER-FINALS ──
  {id:'m97', round:'qf',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'MetLife Stadium',         city:'East Rutherford',dateLabel:'Jul 14',time:'21:00'},
  {id:'m98', round:'qf',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'AT&T Stadium',            city:'Dallas',         dateLabel:'Jul 14',time:'18:00'},
  {id:'m99', round:'qf',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'SoFi Stadium',            city:'Los Angeles',    dateLabel:'Jul 15',time:'21:00'},
  {id:'m100',round:'qf',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Hard Rock Stadium',       city:'Miami',          dateLabel:'Jul 16',time:'21:00'},
  // ── SEMI-FINALS ──
  {id:'m101',round:'sf',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'AT&T Stadium',            city:'Dallas',         dateLabel:'Jul 19',time:'21:00'},
  {id:'m102',round:'sf',group:'',matchday:0, homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'MetLife Stadium',         city:'East Rutherford',dateLabel:'Jul 20',time:'21:00'},
  // ── 3RD PLACE ──
  {id:'m103',round:'3rd',group:'',matchday:0,homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'Hard Rock Stadium',       city:'Miami',          dateLabel:'Jul 22',time:'18:00'},
  // ── FINAL ──
  {id:'m104',round:'final',group:'',matchday:0,homeName:'TBD',homeFlag:'🏳️',homeCode:'TBD',awayName:'TBD',awayFlag:'🏳️',awayCode:'TBD',stadium:'MetLife Stadium',       city:'East Rutherford',dateLabel:'Jul 23',time:'20:00'},
];

const rows = MATCHES.map(m => ({
  id:            m.id,
  round:         m.round,
  group:         m.group,
  matchday:      m.matchday,
  home_name:     m.homeName,
  home_flag:     m.homeFlag,
  home_code:     m.homeCode,
  away_name:     m.awayName,
  away_flag:     m.awayFlag,
  away_code:     m.awayCode,
  stadium:       m.stadium,
  city:          m.city,
  date_label:    m.dateLabel,
  time_label:    m.time,
  status:        'upcoming',
}));

const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'id' });
if (error) { console.error('Seed failed:', error.message); process.exit(1); }
console.log(`Seeded ${rows.length} matches.`);
