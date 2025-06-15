import curses
import random

def main(stdscr):
    # Oyun ekranı ayarları
    curses.curs_set(0)
    stdscr.nodelay(1)
    stdscr.timeout(100)

    sh, sw = stdscr.getmaxyx()
    box = curses.newwin(sh, sw, 0, 0)
    box.border(0)

    # Yılan başlangıç konumu
    snake = [(sh//2, sw//2 + i) for i in range(3)]
    direction = curses.KEY_LEFT

    # Yem oluştur
    food = (random.randint(1, sh - 2), random.randint(1, sw - 2))
    box.addch(food[0], food[1], '*')

    while True:
        # Tuş kontrolü
        key = stdscr.getch()
        direction = key if key in [curses.KEY_UP, curses.KEY_DOWN, curses.KEY_LEFT, curses.KEY_RIGHT] else direction

        # Yeni baş konumu
        head = snake[0]
        if direction == curses.KEY_UP:
            new_head = (head[0] - 1, head[1])
        elif direction == curses.KEY_DOWN:
            new_head = (head[0] + 1, head[1])
        elif direction == curses.KEY_LEFT:
            new_head = (head[0], head[1] - 1)
        elif direction == curses.KEY_RIGHT:
            new_head = (head[0], head[1] + 1)

        snake.insert(0, new_head)

        # Çarpma kontrolü
        if (new_head[0] in [0, sh] or
            new_head[1] in [0, sw] or
            new_head in snake[1:]):
            msg = "GAME OVER!"
            stdscr.addstr(sh//2, sw//2 - len(msg)//2, msg)
            stdscr.refresh()
            curses.napms(2000)
            break

        # Yem yediyse yeni yem oluştur
        if new_head == food:
            food = None
            while food is None or food in snake:
                food = (random.randint(1, sh - 2), random.randint(1, sw - 2))
            box.addch(food[0], food[1], '*')
        else:
            tail = snake.pop()
            box.addch(tail[0], tail[1], ' ')

        box.addch(new_head[0], new_head[1], '#')

curses.wrapper(main)
