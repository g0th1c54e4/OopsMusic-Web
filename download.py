import requests
import os
import json
    # title (歌曲标题)
    # artist (歌曲艺术家)
    # lastupdate (上传时间)
    # play_count (游玩次数)
    # sid (谱面ID)
    # favourite_count (收藏次数)

def sayobot_download(sid, save_path, save_name):
    download_url = "https://dl.sayobot.cn/beatmaps/download/novideo/" + str(sid) #无视频接口
    download_headers = {
        "referer" : download_url,
        'User-Agent' : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" #谷歌浏览器UA
    }
    print("正在下载谱面中......", )
    result = requests.get(url = download_url, headers = download_headers)
    if (result.status_code == 200):
        print("谱面下载完成:", save_name)
        with open(save_path + save_name, 'wb') as file:
            for chunk in result.iter_content(chunk_size = 2048):
                if chunk:
                    file.write(chunk) 
                    file.flush()

def sayobot_search(song_name, song_singer, limit):
    search_api_url = "https://api.sayobot.cn/?post"
    search_post_data = {}
    search_post_data["cmd"] = "beatmaplist"
    search_post_data["keyword"] = song_name
    search_post_data["limit"] = limit
    search_post_data["offset"] = 0
    search_post_data["type"] = "search"
    search_result = requests.post(url = search_api_url, data = json.dumps(search_post_data))

    if (search_result.status_code != 200):
        print("与sayobot服务器连接失败。")
        return []
    search_result_json = json.loads(search_result.text)
    
    try:
        search_item_num = len(search_result_json["data"]) #
    except(KeyError):
        print("没有搜索结果")
        return []

    if (search_item_num == 0):
        print("没有搜索结果")
        return []
    search_list = []
    for i in range(search_item_num):
        sub_search_list = {}
        sub_search_list["Name"] = (search_result_json["data"])[i]["title"]
        sub_search_list["Artist"] = (search_result_json["data"])[i]["artist"]
        sub_search_list["Lastupdate"] = (search_result_json["data"])[i]["lastupdate"]
        sub_search_list["SID"] = (search_result_json["data"])[i]["sid"]
        sub_search_list["FavouriteCount"] = (search_result_json["data"])[i]["favourite_count"]
        sub_search_list["PlayCount"] = (search_result_json["data"])[i]["play_count"]
        if ((song_name.lower() == sub_search_list["Name"].lower()) 
            and (song_singer.lower() == sub_search_list["Artist"].lower())): #筛选
            search_list.append(sub_search_list)
    return search_list

if (__name__ == "__main__"):
    output_path = os.getcwd() + "\\Download\\"
    try:
        os.mkdir(output_path)
    except(FileExistsError):
        pass

    print("当前下载保存路径被设定为:", output_path)

    song_name = input("请输入歌曲名称: ")
    song_singer = input("请输入艺术家名称: ")
    try:
        song_download_limit = int(input("请输入一次性下载谱面的次数: "))
    except ValueError:
        print("参数输入错误")
        exit()

    search_list = sayobot_search(song_name, song_singer, 100000) #100000是显示的最大数量
    if (len(search_list) == 0):
        exit()
    print("搜索出的实际谱面数量:", len(search_list))

    if (song_download_limit > len(search_list)):
        song_download_limit = len(search_list)

    for i in range(song_download_limit):
        save_name = str((search_list[i])["SID"]) + "__" + (search_list[i])["Artist"] + "-" + (search_list[i])["Name"]
        save_name = save_name.replace("\"", "")
        save_name = save_name.replace("/", "")
        save_name = save_name.replace(":", "")
        save_name = save_name.replace("*", "")
        save_name = save_name.replace("?", "")
        save_name = save_name.replace("\"", "")
        save_name = save_name.replace(">", "")
        save_name = save_name.replace("<", "")
        save_name = save_name.replace("|", "")
        # 过滤非法字符
        sayobot_download((search_list[i])["SID"], output_path, save_name + ".osz")