import json, re
from pathlib import Path
import pymupdf
root = Path(__file__).parent
doc = pymupdf.open(root / '必拍.pdf')
headings = ['今天要做的事情', '今天一定要拍', '每天固定檢查']
days = []
for page in list(doc)[1:]:
    text = page.get_text()
    number, date, title = re.search(r'DAY (\d+)｜([^｜]+)｜([^\n]+)', text).groups()
    sections = []
    for i, heading in enumerate(headings):
        content = text.split(heading, 1)[1]
        if i < 2: content = content.split(headings[i+1], 1)[0]
        items = []
        for raw in content.split('□')[1:]:
            label = ' '.join(raw.split()).strip()
            if '\x00' in label: label = label.replace('\x00', '').strip() + '（原 PDF 部分文字缺字）'
            items.append(label)
        sections.append({'id': ['plan','shots','daily'][i], 'title': heading, 'items': items})
    days.append({'day': int(number), 'date': date, 'title': title.replace('\x00', ' → '), 'sections': sections})
assert len(days) == 9
assert all(len(d['sections'][2]['items']) == 7 for d in days)
(root/'src/trip.json').write_text(json.dumps(days, ensure_ascii=False, indent=2), encoding='utf-8')
print('Extracted', sum(len(s['items']) for d in days for s in d['sections']), 'items')
