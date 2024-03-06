import {generateDesignMatrix} from './lib/main.js';

const formula = `C(age_at_menarche, levels=['13','<=10','11','12','14','15','>=16']) + 
C(parity, levels=['0','1','2','>=3']) + 
C(age_first_birth, levels=['<20','20-25','25-30','>=30']) + 
oc_ever + 
C(alcohol_intake, levels=['0','>0-5','5-15','15-25','25-35','35-45','>=45']) + 
bbd + 
famhist + 
C(age_at_menopause, levels=['50-55','<40','40-45','45-50','>=55']) + 
height + 
(C(hrt, levels=['never','current','former']) + hrt_type) * C(bmi_curc, levels=['<25','25-30','>=30'])`;

const formula2 = `C(age_at_menarche, levels=['13','<=10','11','12','14','15','>=16']) + 
C(parity, levels=['0','1','2','>=3']) + 
C(age_first_birth, levels=['<20','20-25','25-30','>=30']) + 
oc_ever + 
C(alcohol_intake, levels=['0','>0-5','5-15','15-25','25-35','35-45','>=45']) + 
bbd + 
famhist + 
C(age_at_menopause, levels=['50-55','<40','40-45','45-50','>=55']) + 
height`;

const dataset = [
    {
        'age_at_menarche': '13',
        'parity': '>=3',
        'age_first_birth': '<20',
        'oc_ever': 1,
        'alcohol_intake': 0,
        'bbd': 0,
        'famhist': 0,
        'age_at_menopause': '40-45',
        'height': 15.5288781821451,
        'hrt': 'former',
        'hrt_type': 0,
        'bmi_curc': '25-30'
    },
    {
        'age_at_menarche': '13',
        'parity': '2',
        'age_first_birth': '<20',
        'oc_ever': 1,
        'alcohol_intake': 0,
        'bbd': 0,
        'famhist': 0,
        'age_at_menopause': '50-55',
        'height': 17.0823439815965,
        'hrt': 'never',
        'hrt_type': 0,
        'bmi_curc': '25-30'
    },
    {
        'age_at_menarche': '11',
        'parity': '2',
        'age_first_birth': '20-25',
        'oc_ever': 1,
        'alcohol_intake': '>0-5',
        'bbd': 0,
        'famhist': 0,
        'age_at_menopause': '>=55',
        'height': 16.4860914823464,
        'hrt': 'never',
        'hrt_type': 0,
        'bmi_curc': '<25'
    }
];

console.log(generateDesignMatrix(formula2, dataset));