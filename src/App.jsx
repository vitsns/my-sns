import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Share2, Play, Heart, Trash2, Lock, MoreVertical, Settings2, Volume2, VolumeX, Check, ShoppingBag, Pencil } from 'lucide-react';
import { supabase } from './supabaseClient';

// --- PIN設定 ---
// PINの正解値はSupabase側の関数(insert_post_with_pin / delete_post_with_pin)にのみ存在する。
// フロント側はPINの正誤を判定せず、入力された値をそのままサーバーに送って検証結果を受け取るだけ。
const PIN_STORAGE_KEY = 'mechene_sns_pin';

function getStoredPin() {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storePin(pin) {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin);
  } catch {
    /* noop */
  }
}

function clearStoredPin() {
  try {
    localStorage.removeItem(PIN_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// タップハートのポップアニメーション(浮かびながらフェードアウト)
const HEART_POP_STYLE = `
@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  15% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -160%) scale(0.9); opacity: 0; }
}
`;

// アイコン背景を花形(スキャロップ)にするclip-path。0〜1のobjectBoundingBoxで正規化済み
const FLOWER_CLIP_PATH_D =
  'M 0.91496 0.50000 C 0.91496 0.50362 0.91474 0.50725 0.91431 0.51085 C 0.91388 0.51445 0.91322 0.51805 0.91239 0.52161 C 0.91156 0.52517 0.91050 0.52872 0.90931 0.53221 C 0.90812 0.53571 0.90673 0.53918 0.90525 0.54259 C 0.90377 0.54601 0.90211 0.54939 0.90042 0.55272 C 0.89872 0.55605 0.89690 0.55933 0.89508 0.56257 C 0.89325 0.56582 0.89135 0.56902 0.88949 0.57219 C 0.88764 0.57536 0.88575 0.57849 0.88394 0.58161 C 0.88214 0.58473 0.88034 0.58781 0.87866 0.59091 C 0.87698 0.59400 0.87535 0.59708 0.87386 0.60017 C 0.87236 0.60327 0.87095 0.60637 0.86967 0.60950 C 0.86840 0.61264 0.86723 0.61578 0.86619 0.61898 C 0.86515 0.62218 0.86424 0.62541 0.86343 0.62870 C 0.86263 0.63199 0.86195 0.63532 0.86134 0.63870 C 0.86073 0.64209 0.86024 0.64553 0.85978 0.64903 C 0.85932 0.65252 0.85896 0.65607 0.85858 0.65965 C 0.85821 0.66324 0.85790 0.66688 0.85754 0.67054 C 0.85718 0.67419 0.85684 0.67790 0.85640 0.68160 C 0.85597 0.68529 0.85552 0.68902 0.85493 0.69271 C 0.85434 0.69640 0.85370 0.70010 0.85289 0.70374 C 0.85208 0.70738 0.85117 0.71100 0.85008 0.71453 C 0.84898 0.71806 0.84775 0.72154 0.84633 0.72491 C 0.84491 0.72828 0.84333 0.73158 0.84156 0.73475 C 0.83979 0.73791 0.83784 0.74098 0.83571 0.74391 C 0.83358 0.74683 0.83127 0.74964 0.82881 0.75230 C 0.82634 0.75496 0.82369 0.75749 0.82093 0.75988 C 0.81816 0.76227 0.81522 0.76452 0.81221 0.76665 C 0.80919 0.76878 0.80602 0.77076 0.80282 0.77266 C 0.79961 0.77455 0.79629 0.77631 0.79296 0.77801 C 0.78963 0.77970 0.78622 0.78129 0.78284 0.78284 C 0.77946 0.78440 0.77604 0.78587 0.77268 0.78734 C 0.76931 0.78882 0.76594 0.79024 0.76265 0.79170 C 0.75935 0.79316 0.75609 0.79460 0.75291 0.79612 C 0.74973 0.79763 0.74661 0.79916 0.74357 0.80079 C 0.74054 0.80242 0.73758 0.80409 0.73471 0.80588 C 0.73183 0.80766 0.72904 0.80953 0.72632 0.81150 C 0.72360 0.81348 0.72096 0.81556 0.71838 0.81774 C 0.71579 0.81992 0.71328 0.82222 0.71080 0.82460 C 0.70831 0.82698 0.70590 0.82948 0.70347 0.83204 C 0.70105 0.83459 0.69867 0.83725 0.69626 0.83993 C 0.69385 0.84261 0.69146 0.84538 0.68902 0.84812 C 0.68657 0.85087 0.68412 0.85367 0.68160 0.85640 C 0.67907 0.85914 0.67651 0.86189 0.67387 0.86453 C 0.67123 0.86717 0.66853 0.86979 0.66574 0.87225 C 0.66295 0.87472 0.66008 0.87711 0.65712 0.87933 C 0.65416 0.88154 0.65112 0.88364 0.64799 0.88553 C 0.64486 0.88742 0.64164 0.88916 0.63835 0.89068 C 0.63505 0.89220 0.63167 0.89353 0.62823 0.89465 C 0.62479 0.89577 0.62127 0.89668 0.61771 0.89738 C 0.61415 0.89809 0.61052 0.89858 0.60688 0.89888 C 0.60324 0.89919 0.59954 0.89929 0.59585 0.89923 C 0.59215 0.89918 0.58843 0.89893 0.58472 0.89858 C 0.58101 0.89822 0.57729 0.89769 0.57360 0.89711 C 0.56991 0.89653 0.56622 0.89580 0.56257 0.89508 C 0.55892 0.89435 0.55530 0.89352 0.55171 0.89274 C 0.54811 0.89195 0.54455 0.89112 0.54103 0.89037 C 0.53750 0.88962 0.53402 0.88886 0.53055 0.88822 C 0.52709 0.88758 0.52367 0.88698 0.52026 0.88651 C 0.51685 0.88605 0.51347 0.88566 0.51009 0.88542 C 0.50672 0.88517 0.50336 0.88504 0.50000 0.88504 C 0.49664 0.88504 0.49328 0.88517 0.48991 0.88542 C 0.48653 0.88566 0.48315 0.88605 0.47974 0.88651 C 0.47633 0.88698 0.47291 0.88758 0.46945 0.88822 C 0.46598 0.88886 0.46250 0.88962 0.45897 0.89037 C 0.45545 0.89112 0.45189 0.89195 0.44829 0.89274 C 0.44470 0.89352 0.44108 0.89435 0.43743 0.89508 C 0.43378 0.89580 0.43009 0.89653 0.42640 0.89711 C 0.42271 0.89769 0.41899 0.89822 0.41528 0.89858 C 0.41157 0.89893 0.40785 0.89918 0.40415 0.89923 C 0.40046 0.89929 0.39676 0.89919 0.39312 0.89888 C 0.38948 0.89858 0.38585 0.89809 0.38229 0.89738 C 0.37873 0.89668 0.37521 0.89577 0.37177 0.89465 C 0.36833 0.89353 0.36495 0.89220 0.36165 0.89068 C 0.35836 0.88916 0.35514 0.88742 0.35201 0.88553 C 0.34888 0.88364 0.34584 0.88154 0.34288 0.87933 C 0.33992 0.87711 0.33705 0.87472 0.33426 0.87225 C 0.33147 0.86979 0.32877 0.86717 0.32613 0.86453 C 0.32349 0.86189 0.32093 0.85914 0.31840 0.85640 C 0.31588 0.85367 0.31343 0.85087 0.31098 0.84812 C 0.30854 0.84538 0.30615 0.84261 0.30374 0.83993 C 0.30133 0.83725 0.29895 0.83459 0.29653 0.83204 C 0.29410 0.82948 0.29169 0.82698 0.28920 0.82460 C 0.28672 0.82222 0.28421 0.81992 0.28162 0.81774 C 0.27904 0.81556 0.27640 0.81348 0.27368 0.81150 C 0.27096 0.80953 0.26817 0.80766 0.26529 0.80588 C 0.26242 0.80409 0.25946 0.80242 0.25643 0.80079 C 0.25339 0.79916 0.25027 0.79763 0.24709 0.79612 C 0.24391 0.79460 0.24065 0.79316 0.23735 0.79170 C 0.23406 0.79024 0.23069 0.78882 0.22732 0.78734 C 0.22396 0.78587 0.22054 0.78440 0.21716 0.78284 C 0.21378 0.78129 0.21037 0.77970 0.20704 0.77801 C 0.20371 0.77631 0.20039 0.77455 0.19718 0.77266 C 0.19398 0.77076 0.19081 0.76878 0.18779 0.76665 C 0.18478 0.76452 0.18184 0.76227 0.17907 0.75988 C 0.17631 0.75749 0.17366 0.75496 0.17119 0.75230 C 0.16873 0.74964 0.16642 0.74683 0.16429 0.74391 C 0.16216 0.74098 0.16021 0.73791 0.15844 0.73475 C 0.15667 0.73158 0.15509 0.72828 0.15367 0.72491 C 0.15225 0.72154 0.15102 0.71806 0.14992 0.71453 C 0.14883 0.71100 0.14792 0.70738 0.14711 0.70374 C 0.14630 0.70010 0.14566 0.69640 0.14507 0.69271 C 0.14448 0.68902 0.14403 0.68529 0.14360 0.68160 C 0.14316 0.67790 0.14282 0.67419 0.14246 0.67054 C 0.14210 0.66688 0.14179 0.66324 0.14142 0.65965 C 0.14104 0.65607 0.14068 0.65252 0.14022 0.64903 C 0.13976 0.64553 0.13927 0.64209 0.13866 0.63870 C 0.13805 0.63532 0.13737 0.63199 0.13657 0.62870 C 0.13576 0.62541 0.13485 0.62218 0.13381 0.61898 C 0.13277 0.61578 0.13160 0.61264 0.13033 0.60950 C 0.12905 0.60637 0.12764 0.60327 0.12614 0.60017 C 0.12465 0.59708 0.12302 0.59400 0.12134 0.59091 C 0.11966 0.58781 0.11786 0.58473 0.11606 0.58161 C 0.11425 0.57849 0.11236 0.57536 0.11051 0.57219 C 0.10865 0.56902 0.10675 0.56582 0.10492 0.56257 C 0.10310 0.55933 0.10128 0.55605 0.09958 0.55272 C 0.09789 0.54939 0.09623 0.54601 0.09475 0.54259 C 0.09327 0.53918 0.09188 0.53571 0.09069 0.53221 C 0.08950 0.52872 0.08844 0.52517 0.08761 0.52161 C 0.08678 0.51805 0.08612 0.51445 0.08569 0.51085 C 0.08526 0.50725 0.08504 0.50362 0.08504 0.50000 C 0.08504 0.49638 0.08526 0.49275 0.08569 0.48915 C 0.08612 0.48555 0.08678 0.48195 0.08761 0.47839 C 0.08844 0.47483 0.08950 0.47128 0.09069 0.46779 C 0.09188 0.46429 0.09327 0.46082 0.09475 0.45741 C 0.09623 0.45399 0.09789 0.45061 0.09958 0.44728 C 0.10128 0.44395 0.10310 0.44067 0.10492 0.43743 C 0.10675 0.43418 0.10865 0.43098 0.11051 0.42781 C 0.11236 0.42464 0.11425 0.42151 0.11606 0.41839 C 0.11786 0.41527 0.11966 0.41219 0.12134 0.40909 C 0.12302 0.40600 0.12465 0.40292 0.12614 0.39983 C 0.12764 0.39673 0.12905 0.39363 0.13033 0.39050 C 0.13160 0.38736 0.13277 0.38422 0.13381 0.38102 C 0.13485 0.37782 0.13576 0.37459 0.13657 0.37130 C 0.13737 0.36801 0.13805 0.36468 0.13866 0.36130 C 0.13927 0.35791 0.13976 0.35447 0.14022 0.35097 C 0.14068 0.34748 0.14104 0.34393 0.14142 0.34035 C 0.14179 0.33676 0.14210 0.33312 0.14246 0.32946 C 0.14282 0.32581 0.14316 0.32210 0.14360 0.31840 C 0.14403 0.31471 0.14448 0.31098 0.14507 0.30729 C 0.14566 0.30360 0.14630 0.29990 0.14711 0.29626 C 0.14792 0.29262 0.14883 0.28900 0.14992 0.28547 C 0.15102 0.28194 0.15225 0.27846 0.15367 0.27509 C 0.15509 0.27172 0.15667 0.26842 0.15844 0.26525 C 0.16021 0.26209 0.16216 0.25902 0.16429 0.25609 C 0.16642 0.25317 0.16873 0.25036 0.17119 0.24770 C 0.17366 0.24504 0.17631 0.24251 0.17907 0.24012 C 0.18184 0.23773 0.18478 0.23548 0.18779 0.23335 C 0.19081 0.23122 0.19398 0.22924 0.19718 0.22734 C 0.20039 0.22545 0.20371 0.22369 0.20704 0.22199 C 0.21037 0.22030 0.21378 0.21871 0.21716 0.21716 C 0.22054 0.21560 0.22396 0.21413 0.22732 0.21266 C 0.23069 0.21118 0.23406 0.20976 0.23735 0.20830 C 0.24065 0.20684 0.24391 0.20540 0.24709 0.20388 C 0.25027 0.20237 0.25339 0.20084 0.25643 0.19921 C 0.25946 0.19758 0.26242 0.19591 0.26529 0.19412 C 0.26817 0.19234 0.27096 0.19047 0.27368 0.18850 C 0.27640 0.18652 0.27904 0.18444 0.28162 0.18226 C 0.28421 0.18008 0.28672 0.17778 0.28920 0.17540 C 0.29169 0.17302 0.29410 0.17052 0.29653 0.16796 C 0.29895 0.16541 0.30133 0.16275 0.30374 0.16007 C 0.30615 0.15739 0.30854 0.15462 0.31098 0.15188 C 0.31343 0.14913 0.31588 0.14633 0.31840 0.14360 C 0.32093 0.14086 0.32349 0.13811 0.32613 0.13547 C 0.32877 0.13283 0.33147 0.13021 0.33426 0.12775 C 0.33705 0.12528 0.33992 0.12289 0.34288 0.12067 C 0.34584 0.11846 0.34888 0.11636 0.35201 0.11447 C 0.35514 0.11258 0.35836 0.11084 0.36165 0.10932 C 0.36495 0.10780 0.36833 0.10647 0.37177 0.10535 C 0.37521 0.10423 0.37873 0.10332 0.38229 0.10262 C 0.38585 0.10191 0.38948 0.10142 0.39312 0.10112 C 0.39676 0.10081 0.40046 0.10071 0.40415 0.10077 C 0.40785 0.10082 0.41157 0.10107 0.41528 0.10142 C 0.41899 0.10178 0.42271 0.10231 0.42640 0.10289 C 0.43009 0.10347 0.43378 0.10420 0.43743 0.10492 C 0.44108 0.10565 0.44470 0.10648 0.44829 0.10726 C 0.45189 0.10805 0.45545 0.10888 0.45897 0.10963 C 0.46250 0.11038 0.46598 0.11114 0.46945 0.11178 C 0.47291 0.11242 0.47633 0.11302 0.47974 0.11349 C 0.48315 0.11395 0.48653 0.11434 0.48991 0.11458 C 0.49328 0.11483 0.49664 0.11496 0.50000 0.11496 C 0.50336 0.11496 0.50672 0.11483 0.51009 0.11458 C 0.51347 0.11434 0.51685 0.11395 0.52026 0.11349 C 0.52367 0.11302 0.52709 0.11242 0.53055 0.11178 C 0.53402 0.11114 0.53750 0.11038 0.54103 0.10963 C 0.54455 0.10888 0.54811 0.10805 0.55171 0.10726 C 0.55530 0.10648 0.55892 0.10565 0.56257 0.10492 C 0.56622 0.10420 0.56991 0.10347 0.57360 0.10289 C 0.57729 0.10231 0.58101 0.10178 0.58472 0.10142 C 0.58843 0.10107 0.59215 0.10082 0.59585 0.10077 C 0.59954 0.10071 0.60324 0.10081 0.60688 0.10112 C 0.61052 0.10142 0.61415 0.10191 0.61771 0.10262 C 0.62127 0.10332 0.62479 0.10423 0.62823 0.10535 C 0.63167 0.10647 0.63505 0.10780 0.63835 0.10932 C 0.64164 0.11084 0.64486 0.11258 0.64799 0.11447 C 0.65112 0.11636 0.65416 0.11846 0.65712 0.12067 C 0.66008 0.12289 0.66295 0.12528 0.66574 0.12775 C 0.66853 0.13021 0.67123 0.13283 0.67387 0.13547 C 0.67651 0.13811 0.67907 0.14086 0.68160 0.14360 C 0.68412 0.14633 0.68657 0.14913 0.68902 0.15188 C 0.69146 0.15462 0.69385 0.15739 0.69626 0.16007 C 0.69867 0.16275 0.70105 0.16541 0.70347 0.16796 C 0.70590 0.17052 0.70831 0.17302 0.71080 0.17540 C 0.71328 0.17778 0.71579 0.18008 0.71838 0.18226 C 0.72096 0.18444 0.72360 0.18652 0.72632 0.18850 C 0.72904 0.19047 0.73183 0.19234 0.73471 0.19412 C 0.73758 0.19591 0.74054 0.19758 0.74357 0.19921 C 0.74661 0.20084 0.74973 0.20237 0.75291 0.20388 C 0.75609 0.20540 0.75935 0.20684 0.76265 0.20830 C 0.76594 0.20976 0.76931 0.21118 0.77268 0.21266 C 0.77604 0.21413 0.77946 0.21560 0.78284 0.21716 C 0.78622 0.21871 0.78963 0.22030 0.79296 0.22199 C 0.79629 0.22369 0.79961 0.22545 0.80282 0.22734 C 0.80602 0.22924 0.80919 0.23122 0.81221 0.23335 C 0.81522 0.23548 0.81816 0.23773 0.82093 0.24012 C 0.82369 0.24251 0.82634 0.24504 0.82881 0.24770 C 0.83127 0.25036 0.83358 0.25317 0.83571 0.25609 C 0.83784 0.25902 0.83979 0.26209 0.84156 0.26525 C 0.84333 0.26842 0.84491 0.27172 0.84633 0.27509 C 0.84775 0.27846 0.84898 0.28194 0.85008 0.28547 C 0.85117 0.28900 0.85208 0.29262 0.85289 0.29626 C 0.85370 0.29990 0.85434 0.30360 0.85493 0.30729 C 0.85552 0.31098 0.85597 0.31471 0.85640 0.31840 C 0.85684 0.32210 0.85718 0.32581 0.85754 0.32946 C 0.85790 0.33312 0.85821 0.33676 0.85858 0.34035 C 0.85896 0.34393 0.85932 0.34748 0.85978 0.35097 C 0.86024 0.35447 0.86073 0.35791 0.86134 0.36130 C 0.86195 0.36468 0.86263 0.36801 0.86343 0.37130 C 0.86424 0.37459 0.86515 0.37782 0.86619 0.38102 C 0.86723 0.38422 0.86840 0.38736 0.86967 0.39050 C 0.87095 0.39363 0.87236 0.39673 0.87386 0.39983 C 0.87535 0.40292 0.87698 0.40600 0.87866 0.40909 C 0.88034 0.41219 0.88214 0.41527 0.88394 0.41839 C 0.88575 0.42151 0.88764 0.42464 0.88949 0.42781 C 0.89135 0.43098 0.89325 0.43418 0.89508 0.43743 C 0.89690 0.44067 0.89872 0.44395 0.90042 0.44728 C 0.90211 0.45061 0.90377 0.45399 0.90525 0.45741 C 0.90673 0.46082 0.90812 0.46429 0.90931 0.46779 C 0.91050 0.47128 0.91156 0.47483 0.91239 0.47839 C 0.91322 0.48195 0.91388 0.48555 0.91431 0.48915 C 0.91474 0.49275 0.91496 0.49638 0.91496 0.50000 Z';

// dvh未対応/不安定な環境向けに、実測pxで高さを管理する
function useViewportHeight() {
  const [vh, setVh] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return vh;
}
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function UploadModal({ onClose, onPosted }) {
  const vh = useViewportHeight();
  const [pinKnown, setPinKnown] = useState(!!getStoredPin());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinChecking, setPinChecking] = useState(false);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [shopUrl, setShopUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePinNext = async () => {
    if (!pinInput) return;
    setPinChecking(true);
    setPinError('');

    const { data: isValid, error: verifyError } = await supabase.rpc('verify_pin', {
      input_pin: pinInput,
    });

    setPinChecking(false);

    if (verifyError || !isValid) {
      setPinError('PINが違います');
      return;
    }

    storePin(pinInput);
    setPinKnown(true);
  };

  const handleSubmit = async () => {
    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      setError('YouTubeのURLを正しく入力してください');
      return;
    }
    setSubmitting(true);
    setError('');

    const pin = getStoredPin();
    const { error: rpcError } = await supabase.rpc('insert_post_with_pin', {
      input_pin: pin,
      input_video_id: videoId,
      input_caption: caption.trim() || '(no caption)',
      input_author: 'You',
      input_shop_url: shopUrl.trim() || null,
    });

    setSubmitting(false);

    if (rpcError) {
      // PINが違う場合はサーバー側から例外が返るので、記憶したPINを破棄してやり直させる
      clearStoredPin();
      setPinKnown(false);
      setPinError('PINが違います。もう一度入力してください');
      return;
    }

    onPosted();
    onClose();
  };

  // --- PIN未確認の場合はまずPIN入力画面を出す ---
  if (!pinKnown) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
        <div className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <Lock size={18} /> PINを入力
            </h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <input
            type="password"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handlePinNext()}
            placeholder="PINコード"
            autoFocus
            className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-1 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500 tracking-widest text-center"
          />
          {pinError && <p className="text-red-400 text-xs mb-2 text-center">{pinError}</p>}

          <button
            onClick={handlePinNext}
            disabled={!pinInput || pinChecking}
            className="w-full bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium rounded-lg py-2.5 mt-3 transition-colors"
          >
            {pinChecking ? '確認中...' : '次へ'}
          </button>
          <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed text-center">
            この端末では一度入力すれば次回から聞かれません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-800 overflow-y-auto"
        style={{ maxHeight: vh * 0.9 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">投稿する</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <label className="text-xs text-neutral-400 mb-1 block">YouTube URL</label>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-1 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500"
        />
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

        <label className="text-xs text-neutral-400 mb-1 block mt-3">キャプション</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="この投稿について..."
          rows={2}
          className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-4 outline-none focus:ring-2 focus:ring-red-500 resize-none placeholder:text-neutral-500"
        />

        <label className="text-xs text-neutral-400 mb-1 block">ショップURL(任意)</label>
        <input
          value={shopUrl}
          onChange={(e) => setShopUrl(e.target.value)}
          placeholder="https://booth.pm/..."
          className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-4 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!url.trim() || submitting}
          className="w-full bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium rounded-lg py-2.5 transition-colors"
        >
          {submitting ? '投稿中...' : '投稿'}
        </button>
        <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">
          ※ 動画本体はYouTube側にホストされます。
        </p>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ postId, onClose, onDeleted }) {
  const [pinKnown, setPinKnown] = useState(!!getStoredPin());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    const pin = pinKnown ? getStoredPin() : pinInput;
    if (!pin) {
      setPinError('PINを入力してください');
      return;
    }

    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc('delete_post_with_pin', {
      input_pin: pin,
      input_post_id: postId,
    });
    setSubmitting(false);

    if (rpcError) {
      clearStoredPin();
      setPinKnown(false);
      setPinError('PINが違います');
      return;
    }

    // 削除に使ったPINが正しかったので、次回の操作用に記憶しておく
    storePin(pin);
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">この投稿を削除しますか?</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {!pinKnown && (
          <>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="PINコード"
              autoFocus
              className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-1 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500 tracking-widest text-center"
            />
            {pinError && <p className="text-red-400 text-xs mb-2 text-center">{pinError}</p>}
          </>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 bg-neutral-800 text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            {submitting ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ post, onClose, onUpdated }) {
  const vh = useViewportHeight();
  const [pinKnown, setPinKnown] = useState(!!getStoredPin());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinChecking, setPinChecking] = useState(false);
  const [url, setUrl] = useState(`https://youtube.com/shorts/${post.videoId}`);
  const [caption, setCaption] = useState(post.caption === '(no caption)' ? '' : post.caption);
  const [shopUrl, setShopUrl] = useState(post.shopUrl || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePinNext = async () => {
    if (!pinInput) return;
    setPinChecking(true);
    setPinError('');

    const { data: isValid, error: verifyError } = await supabase.rpc('verify_pin', {
      input_pin: pinInput,
    });

    setPinChecking(false);

    if (verifyError || !isValid) {
      setPinError('PINが違います');
      return;
    }

    storePin(pinInput);
    setPinKnown(true);
  };

  const handleSubmit = async () => {
    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      setError('YouTubeのURLを正しく入力してください');
      return;
    }
    setSubmitting(true);
    setError('');

    const pin = getStoredPin();
    const { error: rpcError } = await supabase.rpc('update_post_with_pin', {
      input_pin: pin,
      input_post_id: post.id,
      input_video_id: videoId,
      input_caption: caption.trim() || '(no caption)',
      input_shop_url: shopUrl.trim() || null,
    });

    setSubmitting(false);

    if (rpcError) {
      clearStoredPin();
      setPinKnown(false);
      setPinError('PINが違います。もう一度入力してください');
      return;
    }

    onUpdated();
    onClose();
  };

  // --- PIN未確認の場合はまずPIN入力画面を出す ---
  if (!pinKnown) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
        <div className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <Lock size={18} /> PINを入力
            </h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <input
            type="password"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handlePinNext()}
            placeholder="PINコード"
            autoFocus
            className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-1 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500 tracking-widest text-center"
          />
          {pinError && <p className="text-red-400 text-xs mb-2 text-center">{pinError}</p>}

          <button
            onClick={handlePinNext}
            disabled={!pinInput || pinChecking}
            className="w-full bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium rounded-lg py-2.5 mt-3 transition-colors"
          >
            {pinChecking ? '確認中...' : '次へ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-800 overflow-y-auto"
        style={{ maxHeight: vh * 0.9 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">投稿を編集</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <label className="text-xs text-neutral-400 mb-1 block">YouTube URL</label>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="https://youtube.com/shorts/..."
          className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-1 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500"
        />
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

        <label className="text-xs text-neutral-400 mb-1 block mt-3">キャプション</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="この投稿について..."
          rows={2}
          className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-4 outline-none focus:ring-2 focus:ring-red-500 resize-none placeholder:text-neutral-500"
        />

        <label className="text-xs text-neutral-400 mb-1 block">ショップURL(任意)</label>
        <input
          value={shopUrl}
          onChange={(e) => setShopUrl(e.target.value)}
          placeholder="https://booth.pm/..."
          className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 mb-4 outline-none focus:ring-2 focus:ring-red-500 placeholder:text-neutral-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!url.trim() || submitting}
          className="w-full bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium rounded-lg py-2.5 transition-colors"
        >
          {submitting ? '更新中...' : '更新'}
        </button>
      </div>
    </div>
  );
}

function VideoCard({ post, isActive, muted, onMutedChange, siteName, onRequestEdit, onRequestDelete, onControlModeChange }) {
  const [hearts, setHearts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoControlMode, setVideoControlMode] = useState(false); // true = 共有/三点メニュー非表示(動画操作優先)、false = レイヤーON(ハートタップ・共有・投稿が使える)がデフォルト
  const [playing, setPlaying] = useState(true);
  const menuRef = useRef(null);
  const iframeRef = useRef(null);

  // 動画を作り直さずにコマンドだけをYouTube側に伝える(postMessage経由)
  const sendPlayerCommand = (func) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  };

  const handleTap = (e) => {
    // タップで再生/一時停止を切り替えつつ、ハートも飛ばす
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 700);
  };

  const togglePlay = () => {
    const next = !playing;
    setPlaying(next);
    sendPlayerCommand(next ? 'playVideo' : 'pauseVideo');
  };

  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: siteName || 'RECHENE', text: post.caption, url: shareUrl });
      } catch {
        // ユーザーが共有をキャンセルした場合などは何もしない
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const toggleMute = () => {
    const next = !muted;
    onMutedChange(next);
    sendPlayerCommand(next ? 'mute' : 'unMute');
  };

  // アクティブになった時、前のカードから引き継いだ音設定を適用し、再生し直す
  useEffect(() => {
    if (!isActive) {
      setVideoControlMode(false);
      setPlaying(true);
      return;
    }
    // iframeの準備が整うまで少し待ってからコマンドを送る
    const timer = setTimeout(() => {
      sendPlayerCommand(muted ? 'mute' : 'unMute');
      sendPlayerCommand('playVideo');
    }, 500);
    return () => clearTimeout(timer);
  }, [isActive]);

  // アクティブなカードの操作モード状態だけを親(App)に伝える
  useEffect(() => {
    if (isActive) onControlModeChange(videoControlMode);
  }, [isActive, videoControlMode]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [menuOpen]);

  return (
    <div className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-black">
      <style>{HEART_POP_STYLE}</style>
      {/* サムネ→再生の軽量切り替え(全動画同時ロードを避ける) */}
      {isActive ? (
        <iframe
          ref={iframeRef}
          key={post.videoId}
          src={`https://www.youtube.com/embed/${post.videoId}?autoplay=1&mute=1&loop=1&playlist=${post.videoId}&modestbranding=1&rel=0&controls=0&enablejsapi=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={post.caption}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neutral-900">
          <img
            src={`https://img.youtube.com/vi/${post.videoId}/hqdefault.jpg`}
            alt={post.caption}
            className="w-full h-full object-cover opacity-70"
          />
          <Play className="absolute text-white/90" size={56} fill="white" />

        </div>
      )}

      {/* タップ検知レイヤー(レイヤーONの間は画面全体、操作モードONの間は完全に無効化) */}
      {!videoControlMode && (
        <div
          className="absolute inset-0 z-[5]"
          onClick={(e) => {
            handleTap(e);
            togglePlay();
          }}
        />
      )}

      {/* 一時停止中は中央にアイコンを表示 */}
      {!playing && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[6]">
          <Play size={64} className="text-white/80" fill="white" />
        </div>
      )}

      {/* タップした位置にハートを表示 */}
      {hearts.map((h) => (
        <Heart
          key={h.id}
          size={64}
          className="absolute text-red-500 pointer-events-none z-[6]"
          fill="currentColor"
          style={{
            left: h.x,
            top: h.y,
            animation: 'heartPop 700ms ease-out forwards',
          }}
        />
      ))}

      {/* 右サイドのアクションバー(右端中央に集約: ミュート・共有・削除メニュー・動画操作モード切り替え) */}
      <div
        className="absolute right-3 flex flex-col items-center gap-3 z-10"
        style={{ top: '42%', transform: 'translateY(-50%)' }}
      >
        {/* ミュート切り替え(レイヤーOFFの間は非表示) */}
        <button
          onClick={toggleMute}
          className="flex flex-col items-center gap-1 transition-opacity"
          style={{ opacity: videoControlMode ? 0 : 1, pointerEvents: videoControlMode ? 'none' : 'auto' }}
        >
          <div
            className="w-11 h-11 backdrop-blur-md flex items-center justify-center transition-colors"
            style={{
              backgroundColor: !muted ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.15)',
              clipPath: 'url(#flowerClip)',
            }}
          >
            {muted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
          </div>
          <span className="text-white text-xs drop-shadow">音</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 transition-opacity"
          style={{ opacity: videoControlMode ? 0 : 1, pointerEvents: videoControlMode ? 'none' : 'auto' }}
        >
          <div
            className="w-11 h-11 bg-white/15 backdrop-blur-md flex items-center justify-center"
            style={{ clipPath: 'url(#flowerClip)' }}
          >
            {shareCopied ? <Check size={20} className="text-white" /> : <Share2 size={20} className="text-white" />}
          </div>
          <span className="text-white text-xs drop-shadow">共有</span>
        </button>

        {/* 動画操作モードの切り替え(常に表示) */}
        <button onClick={() => setVideoControlMode((v) => !v)} className="flex flex-col items-center gap-1">
          <div
            className="w-11 h-11 backdrop-blur-md flex items-center justify-center transition-colors"
            style={{
              backgroundColor: !videoControlMode ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.15)',
              clipPath: 'url(#flowerClip)',
            }}
          >
            <Settings2 size={18} className="text-white" />
          </div>
          <span className="text-white text-xs drop-shadow">レイヤー</span>
        </button>

        {/* ショップリンク(投稿にURLが設定されてる時だけ表示、レイヤーOFFの間は非表示) */}
        {post.shopUrl && (
          <button
            onClick={() => window.open(post.shopUrl, '_blank', 'noopener,noreferrer')}
            className="flex flex-col items-center gap-1 transition-opacity"
            style={{ opacity: videoControlMode ? 0 : 1, pointerEvents: videoControlMode ? 'none' : 'auto' }}
          >
            <div
              className="w-11 h-11 bg-white/15 backdrop-blur-md flex items-center justify-center"
              style={{ clipPath: 'url(#flowerClip)' }}
            >
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-white text-xs drop-shadow">ショップ</span>
          </button>
        )}

        {/* 共有ボタンの下に3点メニュー(削除) */}
        <div
          ref={menuRef}
          className="relative transition-opacity"
          style={{ opacity: videoControlMode ? 0 : 1, pointerEvents: videoControlMode ? 'none' : 'auto' }}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-11 h-11 bg-white/15 backdrop-blur-md flex items-center justify-center"
              style={{ clipPath: 'url(#flowerClip)' }}
            >
              <MoreVertical size={20} className="text-white" />
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRequestEdit(post);
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 border-b border-neutral-800"
              >
                <Pencil size={16} />
                編集
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRequestDelete(post.id);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-neutral-800 flex items-center gap-2"
              >
                <Trash2 size={16} />
                削除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 左下のキャプション(レイヤーOFFの間は非表示) */}
      <div
        className="absolute left-0 right-20 px-4 z-10 pointer-events-none transition-opacity"
        style={{
          bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))',
          opacity: videoControlMode ? 0 : 1,
        }}
      >
        <p className="text-white font-semibold text-sm mb-1 drop-shadow">@{post.author}</p>
        <p className="text-white/90 text-sm leading-snug drop-shadow">{post.caption}</p>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default function App() {
  const vh = useViewportHeight();
  const frameHeight = Math.min(vh, 900); // PC等で間延びしすぎないよう上限
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeControlMode, setActiveControlMode] = useState(false); // アクティブなカードが動画操作モード中か(デフォルトはレイヤーON)
  const [globalMuted, setGlobalMuted] = useState(true); // 音のON/OFFは全カードで共有し、スクロールしても引き継ぐ
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 削除確認中のpost id
  const [editTarget, setEditTarget] = useState(null); // 編集中のpostオブジェクト
  const [siteName, setSiteName] = useState(''); // 共有時に使うサービス名(DBから取得)
  const containerRef = useRef(null);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, video_id, caption, author, shop_url')
      .order('created_at', { ascending: false });

    if (!error && data) {
      let mapped = data.map((row) => ({
        id: row.id,
        videoId: row.video_id,
        caption: row.caption,
        author: row.author,
        shopUrl: row.shop_url,
      }));

      // 共有URL(?post=ID)経由で開いた場合、その投稿を先頭に来るよう配列を回転させる
      const sharedId = new URLSearchParams(window.location.search).get('post');
      if (sharedId) {
        const idx = mapped.findIndex((p) => String(p.id) === sharedId);
        if (idx > 0) {
          mapped = [...mapped.slice(idx), ...mapped.slice(0, idx)];
        }
      }

      setPosts(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    // 共有時に使うサービス名をDBから取得
    supabase.rpc('get_site_name').then(({ data }) => {
      if (data) setSiteName(data);
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / frameHeight);
      setActiveIndex(Math.max(0, Math.min(idx, posts.length - 1)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [frameHeight, posts.length]);

  return (
    <div
      className="w-full bg-neutral-950 flex items-center justify-center sm:py-6"
      style={{ height: vh }}
    >
      {/* 花形アイコン用のclip-path定義(表示はされない) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="flowerClip" clipPathUnits="objectBoundingBox">
            <path d={FLOWER_CLIP_PATH_D} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="relative w-full sm:max-w-[420px] sm:rounded-[2rem] sm:border sm:border-neutral-800 sm:shadow-2xl overflow-hidden bg-black"
        style={{ height: frameHeight }}
      >
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-neutral-500 text-sm">読み込み中...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center px-8">
          <p className="text-neutral-500 text-sm text-center">まだ投稿がありません。右下の+から投稿してみよう。</p>
        </div>
      ) : (
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-y-contain"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {posts.map((post, i) => (
          <div key={post.id} className="w-full snap-start" style={{ height: frameHeight }}>
            <VideoCard
              post={post}
              isActive={i === activeIndex}
              muted={globalMuted}
              onMutedChange={setGlobalMuted}
              siteName={siteName}
              onRequestDelete={(id) => setDeleteTarget(id)}
              onRequestEdit={(p) => setEditTarget(p)}
              onControlModeChange={setActiveControlMode}
            />
          </div>
        ))}
      </div>
      )}

      {/* 投稿ボタン(右下、動画操作モード中は隠す) */}
      {!activeControlMode && (
        <button
          onClick={() => setShowUpload(true)}
          className="absolute right-4 z-20 w-16 h-16 flex items-center justify-center active:scale-95 transition-transform"
          style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
        >
          <div
            className="w-full h-full bg-red-500 flex items-center justify-center"
            style={{
              clipPath: 'url(#flowerClip)',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
            }}
          >
            <Plus size={30} className="text-white" />
          </div>
        </button>
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onPosted={fetchPosts} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          postId={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchPosts}
        />
      )}

      {editTarget && (
        <EditModal
          post={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={fetchPosts}
        />
      )}
      </div>
    </div>
  );
}
