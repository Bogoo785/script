import json
import re
from pathlib import Path
import pymupdf

root = Path(__file__).parent
doc = pymupdf.open(root / 'Kyushu_9days_YouTube_Script_Compatible.pdf')
clean = lambda text: text.replace('\n', '').strip()
days = {}
for page in list(doc)[1:10]:
    text = page.get_text()
    day = re.search(r'DAY (\d+)｜', text).group(1)
    days[day] = {
        'opening': clean(text.split('開場口白\n')[1].split('必拍畫面')[0]),
        'closing': clean(text.split('收尾口白\n')[1].split('現場提醒')[0]),
    }
days['1']['filmOpening'] = clean(re.search(r'「.*?」', doc[0].get_text(), re.S).group())
days['9']['filmClosing'] = clean(doc[-1].get_text().split('最後一句\n')[1])
assert len(days) == 9
assert all(v.startswith('「') and v.endswith('」') and '\x00' not in v for d in days.values() for v in d.values())
(root / 'src/narration.json').write_text(json.dumps(days, ensure_ascii=False, indent=2), encoding='utf-8')
doc[1].get_pixmap().save(str(root / 'tmp/pdfs/narration-day1.png'))
print('Extracted 18 daily scripts and 2 film scripts')
