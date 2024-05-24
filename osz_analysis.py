import zipfile
import os
import build
 
def unzip_file(zip_path, output_dir):
    zip_object = zipfile.ZipFile(zip_path, 'r')
    result = zip_object.infolist()
    zip_object.extractall(output_dir)
    zip_object.close()
    return result

if (__name__ == "__main__"):
    osz_path = input("请输入对应.osz文件路径(支持拖拽): ")
    osz_path = osz_path.replace("\"", "")
    if (os.path.exists(osz_path) == False):
        print("该文件不存在")
        exit()
    file_name_without_ext, file_ext = os.path.splitext(os.path.basename(osz_path))
    if(file_ext != ".osz"):
        print("文件后缀并非为.osz")
        exit()
    osz_output_path = os.path.dirname(osz_path) + '\\Songs\\' + file_name_without_ext + "\\"
    file_list = unzip_file(osz_path, osz_output_path)
    print(".osz解压缩完成!")
    print("即将开始自动转换谱面......")
    osu_files = []
    for i in range(len(file_list)):
        file_name_without_ext, file_ext = os.path.splitext(os.path.basename(file_list[i].filename))
        if (file_ext == ".osu"):
            sub_osu_file = {}
            sub_osu_file["FileName"] = file_list[i].filename
            sub_osu_file["FileSize"] = file_list[i].file_size
            osu_files.append(sub_osu_file)
    osu_files.sort(key = lambda x: x["FileSize"]) #对文件体积进行排序
    output_path = os.getcwd() + "\\Oops\\"
    for i in range(len(osu_files)):
        print("转换到文件路径: " + build.Analysis(osz_output_path + (osu_files[i])["FileName"] , output_path))