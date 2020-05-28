## 安装

    git clone https://github.com/2linziyi2/sourcemap-commander.git
    cd sourcemap-commander
    npm link

## 使用

    Usage: sourcemap [options]

    Options:
    -V, --version              output the version number
    -u, --url [url]            url地址 (default: "")
    -f, --filepath [filepath]  文件路径 (default: "")
    -e, --error [error]        错误信息
    -l, --line [line]          行数 (default: "")
    -c, --column [column]      列数 (default: "")
    -h, --help                 display help for command

    示例:
    sourcemap -u sourcemap的http地址 -e "错误栈字符串"
    sourcemap -u sourcemap的http地址 -c 391 -l 96
    sourcemap -f /Desktop/ios.bundle.map -e "错误栈字符串"
    sourcemap -f ./ios.bundle.map -c 391 -l 96