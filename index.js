const prompt = require('prompt-sync')();
const shell = require('shelljs');

// constant area:
// coordinate of each point
// each device needs: {screenCenter, enterFight, startAction}


const notes = `
--- Note ---

小號 時長
 *  1-7: 73秒
 *  IW-8: 118秒
 *  龍門市區: 14分45秒, 885秒
 * 
主號
 *  1-7: 78秒

--- Note End ---
`;

const mi11u = {
    screenCenter: [1670, 774],
    enterFight: [2809, 1311],
    startAction: [2537, 1028],
    One_7: 72 //s
}

const huawei = {
    screenCenter: [1140, 565],
    enterFight: [2064, 988],
    startAction: [1857, 755],
    One_7: 78 //s
}

// sleep for specific amount of time, param in ms
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// sleep for specific amount of time with progress bar
async function sleepProgressBar(ms)
{
    const partitionCount = 40; // the progress bar will update 20 times during ms
    const timeLeftUpdateSpeed = 4; // time left updates 4x faster than the progress bar
    // 1x means timeLeft updates when progress bar updates
    const bar_background = '_'
    const bar_head = '_'
    const bar_fill = '◼︎'
    const bar_bound = '⎮'

    // break down the total sleep time into partitionCount amount of pieces
    let waitPerUpdate = ms/(partitionCount * timeLeftUpdateSpeed); 
    let timeLeft = ms;
    let progressUpdateCounter = 1; // only update progress bar when updateCounter == timeLeftSpeed, 
    
    // set up initial state of progress bar
    let progressBar = bar_bound;
    for(let index = 0; index < partitionCount; index ++)
    {
        progressBar = progressBar + bar_background
    }
    printOnExistingLine(`${progressBar}| time left: ${(timeLeft/1000).toFixed(2)}s/ ${ms/1000}s`)
    

    for(let progress = 0; progress < partitionCount * timeLeftUpdateSpeed; progress ++)
    {
        
        // ---- redraw progress line ----
        if(progressUpdateCounter == timeLeftUpdateSpeed)
        {
            progressBar = bar_bound
            filledCounter = 0;
            for(filledCounter = 0; filledCounter < (progress/timeLeftUpdateSpeed); filledCounter ++)
            {
                progressBar = progressBar + bar_fill
            }
            for(let index = 0; index < (partitionCount - filledCounter); index ++)
            {
                if(index == 0)
                    progressBar = progressBar + bar_head
                else 
                    progressBar = progressBar + bar_background
            }
            progressUpdateCounter = 0;
            
        }
        else {
            progressUpdateCounter ++
        }
        // ---- redraw progress line ends ----

        
        await sleep(waitPerUpdate); // sleep
        timeLeft -= waitPerUpdate; // update time left
        
        printOnExistingLine(`${progressBar}| time left: ${(timeLeft/1000).toFixed(2)}s / ${ms/1000}s`)

    }

}

function printOnExistingLine(text){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(text);
}



async function main()
{
    console.log(notes)

    console.log("歡迎使用自動戰鬥腳本");
    console.log("本次連結的設備是? (1)小米11 Ultra[e6] (2)華為[9JB] (3) 小米12S Ultra");
    let device = prompt(">> ");

    console.log("是否有多個設備連接？這次要用哪個設備呢? 預設單設備")
    shell.exec("adb devices")
    let adbDeviceFlag = prompt(">> ")
    if(adbDeviceFlag.trim() == "" && adbDeviceFlag.trim == "\n")
    {
        console.log("無多設備? 那就不加上 -s flag 了")
        adbDeviceFlag = "";
    } else{
        adbDeviceFlag = " -s " + adbDeviceFlag.trim()
        console.log("已加上flag:" + adbDeviceFlag)
    }
    

    console.log("請輸入單次戰鬥的時長(秒): ");
    let duration = prompt(">> ") * 1000; // now in ms
    console.log("請輸入連續戰鬥次數: ");
    let times = prompt(">> ");
    console.log(`所以你想要連續戰鬥 ${times} 次, 每次 ${(duration/1000)}+4.5(冷卻) 秒, 共 ${times * (duration+4500+3000) / 1000} 秒`);
    prompt("按下 Enter 鍵開始\n");

    for(let index = 0; index < times; index++)
    {   
        console.log(`\n---->> 第 ${index+1}/${times} 次戰鬥開始 <<----`)      
                                                    //(剩餘次數) * (單次時長ms) / 1000ms
        console.log(`還有約 ${(times-index)*(duration+4500+3000)/1000} 秒`);
        await oneSession(device, duration, adbDeviceFlag);
        console.log(`---- 第 ${index+1}/${times} 次戰鬥結束 ----`);
        await sleep(1000);
    }

    console.log("\n\n------->>>> Mission Complete <<<<-------")
}


// A fight
// total time = duration + 4500ms + 3000ms, 4500ms 是按鍵冷卻總時長, 3000是迴圈末尾冷卻
async function oneSession(deviceOption, duration, adbDeviceFlag)
{
    let device = mi11u;
    if(deviceOption == 1) device = mi11u;
    else if(deviceOption == 2) device = huawei;
    else console.log("未知設備, 設置為 mi11 u")

    //進入戰鬥 -> 開始行動 -> 等待 (關卡時長) => 再等3秒 (掉落物冒出來, 保險)=> 點擊進入戰鬥 (1s) => loop

    //進入戰鬥

    console.log("點擊 進入關卡");
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.enterFight[0] + " " + device.enterFight[1]);
    
    console.log("wait 1500 ms")
    await sleep(1500);
    console.log("點擊 開始行動");
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.startAction[0] + " " + device.startAction[1]);

    //等待 (關卡時長) + 3秒緩衝 掉落物
    console.log(`\n戰鬥: ${duration}ms + 3000ms = ${(duration+3000)/1000}s`)
    console.log("戰鬥中...")
    await sleepProgressBar(duration + 3000)

    console.log("收尾")
    //點擊屏幕中央
    console.log("點擊中央")
    shell.exec(`adb${adbDeviceFlag} shell input tap ${device.screenCenter[0]} ${device.screenCenter[1]}`)
    
    //點擊開始行動 收尾
    console.log("點擊 開始行動 收尾");
    await sleep(1000)
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.enterFight[0] + " " + device.enterFight[1]);
    //點擊開始行動 收尾
    console.log("點擊 開始行動 收尾");
    await sleep(1000)
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.enterFight[0] + " " + device.enterFight[1]);
}

main()
// console.log("等待秒數 (s)")
// sleepProgressBar(1000 * prompt(">> "))