problem_file_path = '../../../problemFile/'
wrongpw_path = '密码错误.txt'
nopower_path = '无助力值.txt'
manyvoted_path = '多投.txt'
voted_path = '重复.txt'

url = 'https://m.iqiyi.com/user.html?redirect_url=http%3A%2F%2Fwww.iqiyi.com%2Fh5act%2FgeneralVotePlat.html%3FactivityId%3D373#baseLogin'
voted_color = 'color: rgba(36, 94, 255, 0.6); background-color: rgba(255, 255, 255, 0.3);'   # 已助力的button的颜色

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys
import time

def open_browser():
    print("open browser")
    driver = webdriver.Edge()
    driver.get(url)
    return driver

# 账号密码错误
def judge_wrong_pwd(driver, ph, pw):
    # 多次输入错误 
    jq_wrong = "//*[contains(text(),'找回密码')]"
    wrong_div = driver.find_elements_by_xpath(jq_wrong)
    wrong_num = len(wrong_div)
    # 一次输入错误
    jq_inner_wrong = "//*[contains(text(),'帐号或密码错误')]"
    inner_wrong_div = driver.find_elements_by_xpath(jq_inner_wrong)
    inner_wrong_num = len(inner_wrong_div)
    print('wrong_num' + str(wrong_num) + ';  inner_num' + str(inner_wrong_num))

    if (not inner_wrong_num and wrong_num == 1) or (not inner_wrong_num and not wrong_num):
        return False
    else:
        print("wrong number")
        with open(problem_file_path + wrongpw_path, 'a') as f:
            f.write(ph + '----' + pw + '\n')
        return True

def if_slide_exist(driver):  # True: log in succeed.
    flag = True
    while flag:
        slide_num = len(driver.find_elements_by_class_name('slide-modal'))
        if not slide_num:
            flag = False
        suc_num = len(driver.find_elements_by_xpath("//*[contains(text(),'助力')]"))
        if suc_num:
            break
    time.sleep(1)
    return True

def judge_log_in_env_fail(driver, ph, pw):
    jq_inner_wrong = "//*[contains(text(),'环境存在风险')]"
    inner_wrong_div = driver.find_elements_by_xpath(jq_inner_wrong)
    inner_wrong_num = len(inner_wrong_div)
    if inner_wrong_num == 2:        # 发生环境风险
        handle_environment_error()


def handle_environment_error():
    sys.exit(1)

def log_in(driver, cur_ph, cur_pw):
    driver.find_element_by_name('phoneNumber').clear()
    driver.find_element_by_name('phoneNumber').send_keys(cur_ph)
    driver.find_element_by_xpath("/html/body/div[1]/div[1]/form/section/div[1]/div[2]/div[3]/input").clear()
    driver.find_element_by_xpath("/html/body/div[1]/div[1]/form/section/div[1]/div[2]/div[3]/input").send_keys(cur_pw)
    
    driver.find_element_by_class_name('c-btn-base').click()
    time.sleep(1)
    if_slide_exist(driver)

    print('start judge')
    time.sleep(5)     # 预估滑块时间，需要改成检测滑块是否存在
    flag = judge_wrong_pwd(driver, cur_ph, cur_pw)
    if flag:
        time.sleep(1)
        driver.quit()
        return False
    judge_log_in_env_fail(driver, cur_ph, cur_pw)
    return True

## 返回助力值
def return_power(driver):
    power = driver.find_element_by_class_name('highlight').text
    if power == '点击登陆':
        power.click()
        log_in(driver, cur_ph, cur_pw)
        power = driver.find_element_by_class_name('highlight').text
    return int(power)

## 无助力值
def judge_no_power(driver, cur_ph, cur_pw):
    power = return_power(driver)
    if power == 0:
        with open(problem_file_path + nopower_path, 'a') as f:
            f.write(cur_ph + '----' + cur_pw + '\n')
        driver.quit()
        return True
    return False

# 多投
def judge_many_voted(driver, cur_ph, cur_pw):
#     voted_num = count_voted_except_lyx(driver)
    power = return_power(driver)
    if power < 8 and power > 0:
        with open(problem_file_path + manyvoted_path, 'a') as f:
            f.write(cur_ph + '----' + cur_pw + '\n')
        return True
        driver.quit()
    return False

def count_voted_lyx(driver):
    # 刘雨昕投过的数量
    jq_yuxin = "//div[contains(text(),'刘雨昕')]/../following-sibling::div[1]"
    # driver.find_element_by_xpath(jq_yuxin).click()
    lyx_div = driver.find_elements_by_xpath(jq_yuxin)
    lyx_voted = 0
    for div in lyx_div:
        if div.get_attribute('style') == voted_color:
            lyx_voted += 1
    
    return lyx_voted

## 重复
def judge_voted(driver, cur_ph, cur_pw):
#     voted_num = count_voted_except_lyx(driver)
    count = count_voted_lyx(driver)
    if count > 0:
        with open(problem_file_path + voted_path, 'a') as f:
            f.write(cur_ph + '----' + cur_pw + '\n')
        return True
        driver.quit()
    return False

def judge_problem(driver, phone, pwd):
    no_power_flag = judge_no_power(driver, phone, pwd)
    many_voted_flag = judge_many_voted(driver, phone, pwd)
    voted_flag = judge_voted(driver, phone, pwd)
    return no_power_flag or many_voted_flag or voted_flag

def check_success(driver):
    time.sleep(1)
    jq_success = "//*[contains(text(), '助力成功！')]"
    sec_num = len(driver.find_elements_by_xpath(jq_success))
    if sec_num:
        time.sleep(2)   
        sys.exit(0)

def if_slide_exist_for_vote(driver):  # True: vote succeed.
    flag = True
    while flag:
        slide_num = len(driver.find_elements_by_class_name('slide-modal'))
        if not slide_num:
            flag = False
        suc_num = len(driver.find_elements_by_xpath("//*[contains(text(),'助力成功！')]"))
        if suc_num:
            time.sleep(2)
            sys.exit(0)
    time.sleep(1)
    return True

def check_env_fail_for_vote(driver):
    time.sleep(1)
    flag = True
    while flag:
        jq_env_fail = "//*[contains(text(), '*风险*')]"
        sec_num = len(driver.find_elements_by_xpath(jq_env_fail))
        if sec_num:  
            click_vote(driver)
        check_success(driver)

def check_too_fast(driver):
    time.sleep(1)
    flag = True
    while flag:
        jq_env_fail = "//*[contains(text(), '*快*')]"
        sec_num = len(driver.find_elements_by_xpath(jq_env_fail))
        if sec_num:  
            time.sleep(1)
            click_vote(driver)
        check_success(driver)

def click_vote(driver):
    jq_yuxin = "//div[contains(text(),'刘雨昕')]"
    find = driver.find_element_by_xpath(jq_yuxin)
    print(find[0].text)


def start_vote(driver, phone, pwd):
    print('start vote')
    
    flag = False
    while not flag:
        click_vote(driver)

        # 滑块
        if_slide_exist_for_vote(driver)
        
        # 环境有风险
        check_env_fail_for_vote(driver)

        # 操作太快了
        check_too_fast(driver)

def Vote(phone, pwd):
    driver = open_browser()
    flag = log_in(driver, phone, pwd)   # 返回登陆是否成功
    if flag:    # 如果登陆成功
        time.sleep(3)     # 页面刷新时间
        flag = judge_problem(driver, phone, pwd)
        if flag:      
            sys.exit(1)
        else:
            start_vote(driver, phone, pwd)
        pass
    else:
        sys.exit(1)


if __name__ == '__main__':
    phone, pwd = sys.argv[1:3]
    Vote(phone, pwd)

