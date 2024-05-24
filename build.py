import json
import base64
import os
import mutagen
import shutil
from urllib.parse import quote

def GetChapter(textLines, chapter_name):
    for i in range(len(textLines)):
        if (textLines[i] == "[" + chapter_name + "]"):
            i += 1
            j = i
            while(j <= len(textLines)):
                if (textLines[j] == ""):
                    result = []
                    for k in range(j - i):
                        text = textLines[i + k]
                        if (text.startswith("//") == False):
                            result.append(text)
                    return result
                j += 1
    return []

def Analysis_CommaList(textLines):
    result = []
    for i in range(len(textLines)):
        sub = (textLines[i]).split(",")
        result.append(sub)
    return result

def Analysis_KeyMap(textLines):
    result = {}
    for i in range(len(textLines)):
        line = textLines[i]
        line = line.replace(": ", ":")
        line = line.replace(" : ", ":")
        sub = line.split(":")
        result[sub[0]] = sub[1]
    return result

def Analysis(osu_file_path, output_path):
    output_rel_path = output_path
    print("当前谱面文件名称: " + os.path.basename(osu_file_path))
    try:
        os.mkdir(output_rel_path)
    except(FileExistsError):
        pass
    osu_file_path = osu_file_path.replace("\"", "")
    # osu_file_path = "C:\\Users\\90965\\Desktop\\Oops!Project\\source\\Songs\\1964321 IVE - Kitsch\\IVE - Kitsch (homwu) [NINETEEN'S KITSCH].osu"

    osuTextLines = []
    osuText = ""
    with open(osu_file_path, "r", encoding = "utf-8") as file:
        for line in file.readlines():
            line = line.replace("\n", "")
            osuTextLines.append(line)
            osuText += line

    General = Analysis_KeyMap(GetChapter(osuTextLines, "General"))
    Metadata = Analysis_KeyMap(GetChapter(osuTextLines, "Metadata"))
    Events = Analysis_CommaList(GetChapter(osuTextLines, "Events"))
    TimingPoints = Analysis_CommaList(GetChapter(osuTextLines, "TimingPoints"))

    # -------------------------
    print("-------------------------------------")
    json_result = {}

    json_result["Title"] = Metadata["TitleUnicode"]
    json_result["TitleFull"] = Metadata["TitleUnicode"] + "(" + Metadata["Title"] + ")"
    print("谱面标题:", json_result["TitleFull"])

    json_result["Artist"] = Metadata["ArtistUnicode"]
    json_result["ArtistFull"] = Metadata["ArtistUnicode"] + "(" + Metadata["Artist"] + ")"
    print("谱面艺术家:", json_result["ArtistFull"])

    json_result["Name"] = json_result["Artist"] + " - " + json_result["Title"]
    json_result["NameFull"] = json_result["ArtistFull"] + " - " + json_result["Title"]
    print("谱面全名:", json_result["NameFull"])
    outputName = json_result["NameFull"]
    outputName = outputName.replace("\"", "")
    outputName = outputName.replace("/", "")
    outputName = outputName.replace(":", "")
    outputName = outputName.replace("*", "")
    outputName = outputName.replace("?", "")
    outputName = outputName.replace("\"", "")
    outputName = outputName.replace(">", "")
    outputName = outputName.replace("<", "")
    outputName = outputName.replace("|", "")
    #过滤无效字符

    json_result["OsuID"] = int(Metadata["BeatmapSetID"])
    print("Osu谱面ID:", json_result["OsuID"])

    json_result["OsuLevelID"] = int(Metadata["BeatmapID"])
    print("Osu谱面难度ID:", json_result["OsuLevelID"])

    json_result["Creator"] = Metadata["Creator"]
    print("谱师(谱面创建者):", json_result["Creator"])

    json_result["Tags"] = Metadata["Tags"]
    print("标签:", json_result["Tags"])

    outputNameDir = str(json_result["OsuID"]) + " " + outputName
    try:
        os.mkdir(output_rel_path + outputNameDir + "\\") #目录创建
    except(FileExistsError):
        pass
    json_result["Dir"] = quote("./Oops/" + outputNameDir + "/") #URL编码

    json_result["BackgroundImage"] = ""
    for i in range(len(Events)):
        if ((Events[i])[0] == (Events[i])[1] == "0"):
            background_file_name = ((Events[i])[2]).replace("\"", "")
            
            old_background_path = os.path.dirname(osu_file_path) + "\\" + background_file_name
            new_background_path = output_rel_path + outputNameDir + "\\" + background_file_name

            shutil.copyfile(old_background_path, new_background_path)

            json_result["BackgroundImage"] = quote(background_file_name) #URL编码
            print("谱面背景图名称:", json_result["BackgroundImage"])
            break
    json_result["FileName"] = General["AudioFilename"]
    print("对应歌曲文件(目标目录中):", json_result["FileName"])

    songFilePath = os.path.dirname(osu_file_path) + "\\" + json_result["FileName"]
    songFile = open(songFilePath, "rb")
    fileBufferText = str(base64.b64encode(songFile.read()))[2:-1]

    json_result["FileBuffer"] = fileBufferText

    songFile.close()

    audio = mutagen.File(songFilePath)
    json_result["SongLength"] = (audio.info.length * 1000)
    print("歌曲长度(ms):", json_result["SongLength"])

    TimePoint = []
    for i in range(len(TimingPoints)):
        subTimePoint = {}

        subTimePoint["StartTime"] = float((TimingPoints[i])[0])
        if ((i + 1) != len(TimingPoints)):
            subTimePoint["EndTime"] = float((TimingPoints[i + 1])[0])
        else:
            subTimePoint["EndTime"] = (audio.info.length * 1000)
        if(subTimePoint["StartTime"] == subTimePoint["EndTime"]):
            print("[警告] 存在起终时间一致的区间:", i, "   Web时间轴可能会无法抵达该区间!")
        subTimePoint["Beat"] = int((TimingPoints[i])[2])
        subTimePoint["BPM"] = 0
        if ((TimingPoints[i])[6] == "1"):
            subTimePoint["BPM"] = (1 / float((TimingPoints[i])[1]) * 1000 * 60)
            # print("有效BPM区间:", i, "   BPM值为:", (1 / float((TimingPoints[i])[1]) * 1000 * 60), "   节拍数:", subTimePoint["Beat"], "   区间起始时间:", subTimePoint["StartTime"])
        subTimePoint["Kiai"] = bool(int((TimingPoints[i])[7]) & 1)
        if (bool(int((TimingPoints[i])[7]) & 1) == True):
            pass
            # print("kiai时间区间:", i,"   节拍数:", subTimePoint["Beat"], "   区间起始时间:", subTimePoint["StartTime"])
        subTimePoint["FirstKiai"] = False #占位
        TimePoint.append(subTimePoint)

    i = 0
    while(i < len(TimingPoints)):
        if (bool(int((TimingPoints[i])[7]) & 1) == True):
            j = i
            while(j < len(TimingPoints)):
                if (bool(int((TimingPoints[j])[7]) & 1) == False):
                    break
                else:
                    (TimePoint[j])["FirstKiai"] = False
                j += 1
            (TimePoint[i])["FirstKiai"] = True
            #print("首次kiai时间区间:", i, "   区间起始时间:", subTimePoint["StartTime"])
            i = j
            continue
        i += 1


    json_result["TimePointNum"] = len(TimingPoints)
    print("时间区间总数:", json_result["TimePointNum"])
    json_result["TimePoint"] = TimePoint

    json_text = json.dumps(json_result)

    final_output_path = output_rel_path + outputNameDir + "\\" + str(json_result["OsuLevelID"]) + "__" + outputName + ".oops"

    json_file = open(final_output_path, "w", encoding = "utf-8")

    json_file.write(json_text)
    json_file.close()

    print("osu谱面文件解析完成\n\n")
    return final_output_path

if (__name__ == "__main__"):
    print("OopsMusic")
    print("By LingMo")
    osu_file_path = input("请输入.osu文件路径(支持拖拽): ")
    output_path = os.getcwd() + "\\Oops\\"
    print("当前保存路径为:", output_path)
    print("转换到文件路径: " + Analysis(osu_file_path, output_path))