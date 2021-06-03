from selenium import webdriver
from bs4 import BeautifulSoup
import time
import json

data = {}
data ['questions'] = []

PATH = "C:\Program Files (x86)\chromedriver.exe"
driver = webdriver.Chrome (PATH)

driver.get ("https://hqbuff.com/us/practice/trivia")

question_list = driver.find_elements_by_class_name ("round--trivia")

for question in question_list:
    button = question.find_element_by_class_name ("trivia-answer")
    button.click ()
    js_scroll = "window.scrollBy(0, 1000);"
    driver.execute_script(js_scroll)

new_html = driver.page_source
soup = BeautifulSoup (new_html, 'lxml')

questions = soup.find_all ('div', class_ = "round--trivia")

for question in questions:
    question_text = question.find ('h3', class_ = "round-hint").text

    if 'this' not in question_text.lower ():
        answer_list = question.find_all ('div', class_ = "answer-text")
        answer_1 = answer_list [0].text
        answer_2 = answer_list [1].text
        answer_3 = answer_list [2].text

        data ['questions'].append ({
            'question': question_text,
            'answer1': answer_1,
            'answer2': answer_2,
            'answer3': answer_3,
            'answer': '',
            'category': '',
            'difficulty': (int (question.get ('id')) - 1) // 3 # Take a number from 1-12 and convert to a number from 0-3
        })

# Get a new batch of questions after the current ones are exhausted
# new_questions = driver.find_element_by_class_name ("game-title")
# button = new_questions.find_element_by_tag_name ("span")
# button.click ()

with open ('output.txt', 'w') as outfile:
    json.dump (data, outfile)

# time.sleep (10)

driver.quit ()

# Note: If a question contains the word 'this' just ignore it
# See if I can track duplicates then have a num_uniques variable to track how many unique questions per round I get
# Then end the program when it hits 0 once or something
