import json, re
from pathlib import Path
import pymupdf

root = Path(__file__).parent
doc = pymupdf.open(root / '九州9天8夜_實際行程_YouTube拍攝腳本.pdf')
doc.xref_set_key(3, 'Encoding', '/UniCNS-UCS2-H')
doc = pymupdf.open(stream=doc.tobytes(), filetype='pdf')
days = []
titles = ['高雄 → 博多 → 鹿兒島', '鹿兒島市區', '指宿・玉手箱與砂浴', '櫻島自駕', '霧島自駕', 'Outlet・福岡夜生活', '門司港・唐戶市場・皿倉山', '福岡市區', '最後一天・回高雄']
tags = ['移動日', '城市漫遊', '觀光列車 / 自駕', '渡輪 / 自駕', '自然 / 自駕', '購物 / 美食', '海港 / 夜景', '散步 / 購物', '分組回程']
def compact(s): return s.replace('\n', '').strip()
def items(s): return [compact(x) for x in s.split('□')[1:]]
for i, p in enumerate(list(doc)[1:10]):
    t = p.get_text()
    itinerary, rest = t.split('今日行程\n', 1)[1].split('開場口白\n', 1)
    opening, rest = rest.split('必拍畫面\n', 1)
    shots, rest = rest.split('收尾口白\n', 1)
    closing, reminder = rest.split('現場提醒：', 1)
    days.append(dict(title=titles[i], tag=tags[i], date=f'10/{i+5}', itinerary=items(itinerary), opening=compact(opening), shots=items(shots), closing=compact(closing), reminder=compact(reminder)))
days[2]['itinerary'][4] = '黃金鳥居（原稿行程列為「黃金鳥 G」，依同頁拍攝腳本整理）'
days[3]['itinerary'][4] += '｜名稱待確認'
last = doc[10].get_text()
common = items(last.split('整趟旅程固定 Shot List\n')[1].split('推薦固定提問')[0])
intro = doc[0].get_text().split('使用方式\n')[1].split('全片片頭建議\n')
data = dict(days=days, common=common, intro=compact(intro[0]), filmOpening=compact(intro[1]), questions=compact(last.split('推薦固定提問\n')[1].split('最後一句')[0]), finalLine=compact(last.split('最後一句\n')[1]))
template = (root / 'site-template.html').read_text(encoding='utf-8')
(root / '九州旅行手帳.html').write_text(template.replace('__TRIP_DATA__', json.dumps(data, ensure_ascii=False)), encoding='utf-8')
print('Built 9 days:', sum(len(d['itinerary']) for d in days), 'itinerary items;', sum(len(d['shots']) for d in days), 'shots')
