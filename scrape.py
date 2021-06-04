from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import json

PATH = "C:\Program Files (x86)\chromedriver.exe"
path_to_extension = r'C:\Users\Me\Desktop\1.35.2_53'

chrome_options = Options()
chrome_options.add_argument('load-extension=' + path_to_extension)

driver = webdriver.Chrome(PATH, chrome_options=chrome_options)
driver.create_options()

data = {}
data ['questions'] = []

num_unique = 12
num_total = 0

while num_unique > 0:
    num_unique = 0

    driver.get ("https://hqbuff.com/us/practice/trivia")

    question_list = driver.find_elements_by_class_name ("round--trivia")

    for question in question_list:
        button = question.find_element_by_class_name ("trivia-answer")
        #if the bot clicks on an ad again put the 1 second wait here
        button.click ()
        js_scroll = "window.scrollBy(0, 400);"
        driver.execute_script(js_scroll)
        time.sleep (1)

    new_html = driver.page_source
    soup = BeautifulSoup (new_html, 'lxml')

    questions = soup.find_all ('div', class_ = "round--trivia")

    for question in questions:
        same_question = False
        question_text = question.find ('h3', class_ = "round-hint").text

        if 'this' not in question_text.lower ():
            for p in data ['questions']:
                if p['question'] == question_text:
                    print ('duplicate detected')
                    same_question = True
                    break

            if same_question == False:
                num_unique += 1

                answer_list = question.find_all ('div', class_ = "answer-text")
                answer_1 = answer_list [0].text
                answer_2 = answer_list [1].text
                answer_3 = answer_list [2].text

                correct_answer = question.find ('div', class_ = "green")

                if correct_answer is not None:
                    correct_answer_2 = correct_answer.find ('div', class_ = "answer-text").text

                    data ['questions'].append ({
                        'question': question_text,
                        'answer1': answer_1,
                        'answer2': answer_2,
                        'answer3': answer_3,
                        'answer': correct_answer_2,
                        'category': '',
                        'difficulty': (int (question.get ('id')) - 1) // 3 # Take a number from 1-12 and convert to a number from 0-3
                    })

    num_total += num_unique
    print ("Unique: %s Total: %s" % (num_unique, num_total))
    time.sleep (5)

with open ('output.txt', 'w') as outfile:
    json.dump (data, outfile)

driver.quit ()
