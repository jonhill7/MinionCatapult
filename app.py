import math
from dataclasses import dataclass

import pygame


pygame.init()

WIDTH, HEIGHT = 1440, 900
MIN_WIDTH, MIN_HEIGHT = 1180, 760
FPS = 60

BG = (11, 16, 24)
PANEL = (20, 26, 38)
CARD = (27, 35, 50)
TEXT = (243, 247, 252)
MUTED = (177, 192, 210)
GRID = (60, 74, 96)
TRACK = (67, 84, 110)
KNOB = (245, 196, 110)
BALL = (240, 122, 70)
GRAPH_LINE = (123, 223, 242)
VECTOR = (245, 214, 123)
GROUND = (189, 140, 93)
WHITE = (255, 255, 255)


@dataclass(frozen=True)
class Planet:
    name: str
    gravity: float
    sky_top: tuple[int, int, int]
    sky_bottom: tuple[int, int, int]
    ground: tuple[int, int, int]
    accent: tuple[int, int, int]


PLANETS = [
    Planet("Mercury", 3.70, (33, 35, 42), (113, 92, 81), (137, 117, 103), (234, 194, 96)),
    Planet("Venus", 8.87, (84, 49, 27), (202, 135, 67), (170, 116, 65), (255, 226, 138)),
    Planet("Earth", 9.81, (20, 48, 94), (128, 196, 255), (87, 145, 89), (85, 196, 217)),
    Planet("Moon", 1.62, (18, 24, 34), (84, 98, 120), (135, 138, 145), (223, 231, 240)),
    Planet("Mars", 3.71, (74, 32, 25), (223, 116, 82), (153, 86, 62), (255, 198, 132)),
    Planet("Jupiter", 24.79, (67, 41, 28), (193, 143, 92), (164, 120, 82), (255, 221, 141)),
    Planet("Saturn", 10.44, (63, 58, 82), (204, 172, 118), (169, 142, 98), (250, 228, 177)),
    Planet("Neptune", 11.15, (19, 36, 77), (73, 124, 200), (84, 120, 160), (150, 220, 255)),
]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def nice_number(value: float) -> float:
    if value <= 0:
        return 1
    exponent = math.floor(math.log10(value))
    fraction = value / (10 ** exponent)
    if fraction <= 1:
        nice_fraction = 1
    elif fraction <= 2:
        nice_fraction = 2
    elif fraction <= 5:
        nice_fraction = 5
    else:
        nice_fraction = 10
    return nice_fraction * (10 ** exponent)


class Button:
    def __init__(self, rect: pygame.Rect, text: str, fill: tuple[int, int, int], text_color: tuple[int, int, int] = TEXT):
        self.rect = rect
        self.text = text
        self.fill = fill
        self.text_color = text_color

    def draw(self, surface: pygame.Surface, font: pygame.font.Font) -> None:
        mouse = pygame.mouse.get_pos()
        hovered = self.rect.collidepoint(mouse)
        color = tuple(min(255, c + 18) for c in self.fill) if hovered else self.fill
        pygame.draw.rect(surface, color, self.rect, border_radius=14)
        label = font.render(self.text, True, self.text_color)
        surface.blit(label, label.get_rect(center=self.rect.center))

    def clicked(self, event: pygame.event.Event) -> bool:
        return event.type == pygame.MOUSEBUTTONDOWN and event.button == 1 and self.rect.collidepoint(event.pos)


class Slider:
    def __init__(self, label: str, minimum: float, maximum: float, value: float, fmt: str):
        self.label = label
        self.minimum = minimum
        self.maximum = maximum
        self.value = value
        self.fmt = fmt
        self.dragging = False
        self.track_rect = pygame.Rect(0, 0, 10, 10)

    def set_rect(self, rect: pygame.Rect) -> None:
        self.track_rect = rect

    def handle_event(self, event: pygame.event.Event) -> bool:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1 and self.track_rect.collidepoint(event.pos):
            self.dragging = True
            self._set_from_x(event.pos[0])
            return True
        if event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            self.dragging = False
        if event.type == pygame.MOUSEMOTION and self.dragging:
            self._set_from_x(event.pos[0])
            return True
        return False

    def _set_from_x(self, x: float) -> None:
        left = self.track_rect.left
        width = max(self.track_rect.width, 1)
        ratio = clamp((x - left) / width, 0.0, 1.0)
        self.value = self.minimum + ratio * (self.maximum - self.minimum)

    def draw(self, surface: pygame.Surface, label_font: pygame.font.Font, value_font: pygame.font.Font) -> None:
        label = label_font.render(self.label, True, TEXT)
        surface.blit(label, (self.track_rect.x, self.track_rect.y - 28))

        value = value_font.render(self.fmt.format(self.value), True, MUTED)
        surface.blit(value, (self.track_rect.right - value.get_width(), self.track_rect.y - 28))

        pygame.draw.line(surface, TRACK, (self.track_rect.left, self.track_rect.centery), (self.track_rect.right, self.track_rect.centery), 6)
        ratio = (self.value - self.minimum) / (self.maximum - self.minimum)
        fill_x = self.track_rect.left + ratio * self.track_rect.width
        pygame.draw.line(surface, KNOB, (self.track_rect.left, self.track_rect.centery), (fill_x, self.track_rect.centery), 6)
        pygame.draw.circle(surface, KNOB, (int(fill_x), self.track_rect.centery), 10)
        pygame.draw.circle(surface, WHITE, (int(fill_x), self.track_rect.centery), 10, 2)


class Dropdown:
    def __init__(self, options: list[str], selected: str):
        self.options = options
        self.selected = selected
        self.rect = pygame.Rect(0, 0, 10, 10)
        self.open = False

    def set_rect(self, rect: pygame.Rect) -> None:
        self.rect = rect

    def handle_event(self, event: pygame.event.Event) -> str | None:
        if event.type != pygame.MOUSEBUTTONDOWN or event.button != 1:
            return None

        if self.rect.collidepoint(event.pos):
            self.open = not self.open
            return None

        if self.open:
            for index, option in enumerate(self.options):
                item_rect = pygame.Rect(self.rect.x, self.rect.bottom + 6 + index * (self.rect.height + 4), self.rect.width, self.rect.height)
                if item_rect.collidepoint(event.pos):
                    self.selected = option
                    self.open = False
                    return option
            self.open = False
        return None

    def draw(self, surface: pygame.Surface, font: pygame.font.Font, small_font: pygame.font.Font) -> None:
        pygame.draw.rect(surface, CARD, self.rect, border_radius=12)
        pygame.draw.rect(surface, (87, 102, 126), self.rect, 1, border_radius=12)
        title = small_font.render("Planet", True, MUTED)
        surface.blit(title, (self.rect.x, self.rect.y - 24))
        label = font.render(self.selected, True, TEXT)
        surface.blit(label, (self.rect.x + 14, self.rect.y + 10))
        pygame.draw.polygon(
            surface,
            MUTED,
            [
                (self.rect.right - 24, self.rect.y + 18),
                (self.rect.right - 12, self.rect.y + 18),
                (self.rect.right - 18, self.rect.y + 26),
            ],
        )

        if self.open:
            for index, option in enumerate(self.options):
                item_rect = pygame.Rect(self.rect.x, self.rect.bottom + 6 + index * (self.rect.height + 4), self.rect.width, self.rect.height)
                fill = (47, 61, 83) if option == self.selected else CARD
                pygame.draw.rect(surface, fill, item_rect, border_radius=10)
                pygame.draw.rect(surface, (87, 102, 126), item_rect, 1, border_radius=10)
                item = font.render(option, True, TEXT)
                surface.blit(item, (item_rect.x + 14, item_rect.y + 10))


class GravityLessonApp:
    def __init__(self) -> None:
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("Planet Launch Lab")
        self.clock = pygame.time.Clock()

        self.title_font = pygame.font.SysFont("georgia", 34, bold=True)
        self.section_font = pygame.font.SysFont("georgia", 21, bold=True)
        self.label_font = pygame.font.SysFont("segoeui", 18)
        self.small_font = pygame.font.SysFont("segoeui", 15)
        self.metric_font = pygame.font.SysFont("segoeuisemibold", 30)
        self.button_font = pygame.font.SysFont("segoeuisemibold", 18)

        self.planet_dropdown = Dropdown([planet.name for planet in PLANETS], "Earth")
        self.speed_slider = Slider("Launch Speed", 10, 120, 52, "{:.0f} m/s")
        self.angle_slider = Slider("Launch Angle", 10, 85, 52, "{:.0f} deg")
        self.height_slider = Slider("Launch Height", 0, 80, 0, "{:.0f} m")
        self.zoom_slider = Slider("Camera Zoom", 0.6, 2.2, 1.0, "{:.2f}x")
        self.dt_slider = Slider("Time Step", 0.01, 0.08, 0.03, "{:.2f} s")

        self.launch_button = Button(pygame.Rect(0, 0, 10, 10), "Launch / Pause", (53, 107, 214))
        self.reset_button = Button(pygame.Rect(0, 0, 10, 10), "Reset", (76, 86, 106))
        self.balance_button = Button(pygame.Rect(0, 0, 10, 10), "Try 45°", (197, 136, 48))

        self.show_vectors = True
        self.status_text = "Press Launch to test a prediction."
        self.running = False

        self.range = 0.0
        self.max_height = 0.0
        self.time_elapsed = 0.0
        self.x = 0.0
        self.y = 0.0
        self.vx = 0.0
        self.vy = 0.0
        self.path: list[tuple[float, float]] = []
        self.reset_shot()

    @property
    def planet(self) -> Planet:
        for planet in PLANETS:
            if planet.name == self.planet_dropdown.selected:
                return planet
        return PLANETS[2]

    def reset_shot(self) -> None:
        angle = math.radians(self.angle_slider.value)
        speed = self.speed_slider.value
        self.x = 0.0
        self.y = self.height_slider.value
        self.vx = speed * math.cos(angle)
        self.vy = speed * math.sin(angle)
        self.range = 0.0
        self.max_height = self.y
        self.time_elapsed = 0.0
        self.path = [(self.x, self.y)]
        self.running = False
        self.status_text = "Press Launch to test a prediction."

    def toggle_launch(self) -> None:
        if self.y <= 0 and len(self.path) > 1:
            self.reset_shot()
        self.running = not self.running
        if self.running:
            self.status_text = f"Launched on {self.planet.name}. Compare the path to the graph on the right."
        else:
            self.status_text = "Simulation paused. Adjust a parameter or resume the launch."

    def set_balanced_shot(self) -> None:
        self.angle_slider.value = 45.0
        self.reset_shot()
        self.status_text = "A 45 degree launch is a strong guess to compare against other angles."

    def update_simulation(self) -> None:
        if not self.running:
            return

        dt = self.dt_slider.value
        g = self.planet.gravity
        self.time_elapsed += dt
        self.x += self.vx * dt
        self.y += self.vy * dt - 0.5 * g * dt * dt
        self.vy -= g * dt
        if self.y <= 0:
            self.y = 0
            self.running = False
            self.status_text = "The ball landed. Reset or change one variable and compare the new parabola."
        self.range = self.x
        self.max_height = max(self.max_height, self.y)
        self.path.append((self.x, self.y))

    def layout(self) -> dict[str, pygame.Rect]:
        width, height = self.screen.get_size()
        width = max(width, MIN_WIDTH)
        height = max(height, MIN_HEIGHT)

        outer = 18
        gap = 14
        header_h = 78
        bottom_h = 186
        right_w = int(width * 0.32)

        header = pygame.Rect(outer, outer, width - outer * 2, header_h)
        content_top = header.bottom + 12
        content_h = height - content_top - outer - bottom_h - gap

        left = pygame.Rect(outer, content_top, width - right_w - outer * 2 - gap, content_h)
        right = pygame.Rect(left.right + gap, content_top, right_w, content_h)
        bottom = pygame.Rect(outer, left.bottom + gap, width - outer * 2, bottom_h)
        right_graph = pygame.Rect(right.x, right.y, right.width, int(right.height * 0.46))
        right_info = pygame.Rect(right.x, right_graph.bottom + gap, right.width, right.bottom - right_graph.bottom - gap)

        return {
            "header": header,
            "left": left,
            "right_graph": right_graph,
            "right_info": right_info,
            "bottom": bottom,
        }

    def draw(self) -> None:
        self.screen.fill(BG)
        panes = self.layout()

        self.draw_header(panes["header"])
        self.draw_simulation(panes["left"])
        self.draw_graph(panes["right_graph"])
        self.draw_info(panes["right_info"])
        self.draw_controls(panes["bottom"])
        pygame.display.flip()

    def draw_header(self, rect: pygame.Rect) -> None:
        title = self.title_font.render("Planet Launch Lab", True, TEXT)
        subtitle = self.label_font.render(
            "Use physics to teach algebra, graphing, and how changing one variable changes the whole story.",
            True,
            MUTED,
        )
        self.screen.blit(title, (rect.x, rect.y + 2))
        self.screen.blit(subtitle, (rect.x + 2, rect.y + 44))

    def draw_panel(self, rect: pygame.Rect) -> None:
        pygame.draw.rect(self.screen, PANEL, rect, border_radius=20)
        pygame.draw.rect(self.screen, (49, 61, 80), rect, 1, border_radius=20)

    def draw_simulation(self, rect: pygame.Rect) -> None:
        self.draw_panel(rect)
        header = self.section_font.render("Simulation View", True, TEXT)
        status = self.small_font.render(self.status_text, True, MUTED)
        self.screen.blit(header, (rect.x + 18, rect.y + 14))
        self.screen.blit(status, (rect.x + 20, rect.y + 48))

        view = pygame.Rect(rect.x + 14, rect.y + 82, rect.width - 28, rect.height - 96)
        self.draw_world(view)

    def draw_world(self, rect: pygame.Rect) -> None:
        planet = self.planet
        sky = pygame.Surface((rect.width, rect.height))
        for y in range(rect.height):
            blend = y / max(rect.height - 1, 1)
            color = tuple(int(planet.sky_top[i] * (1 - blend) + planet.sky_bottom[i] * blend) for i in range(3))
            pygame.draw.line(sky, color, (0, y), (rect.width, y))
        self.screen.blit(sky, rect.topleft)

        for band in range(3):
            band_rect = pygame.Rect(rect.x - 100, rect.y + 40 + band * 58, rect.width + 180, 94)
            tint = tuple(max(0, c - 18 * band) for c in planet.sky_bottom)
            pygame.draw.ellipse(self.screen, tint, band_rect)

        for index in range(12):
            star_x = rect.x + 45 + index * max(90, rect.width // 11)
            pygame.draw.circle(self.screen, WHITE, (star_x, rect.y + 36 + (index % 3) * 18), 2)

        ground_y = rect.bottom - 88
        pygame.draw.rect(self.screen, planet.ground, (rect.x, ground_y, rect.width, rect.bottom - ground_y))
        pygame.draw.line(self.screen, (253, 244, 224), (rect.x, ground_y), (rect.right, ground_y), 3)

        ppm = 8.5 * self.zoom_slider.value
        camera_x = max(self.x - rect.width * 0.30 / ppm, 0.0)

        def to_screen(wx: float, wy: float) -> tuple[int, int]:
            sx = rect.x + 74 + (wx - camera_x) * ppm
            sy = ground_y - wy * ppm
            return int(sx), int(sy)

        tick_step = max(10, int(nice_number(rect.width / ppm / 6)))
        visible_start = int(camera_x // tick_step) * tick_step
        visible_end = int(camera_x + rect.width / ppm) + tick_step
        for tick in range(visible_start, visible_end + 1, tick_step):
            sx, _ = to_screen(tick, 0)
            if rect.x <= sx <= rect.right:
                pygame.draw.line(self.screen, (234, 240, 247), (sx, ground_y), (sx, ground_y + 9), 2)
                label = self.small_font.render(f"{tick} m", True, TEXT)
                self.screen.blit(label, (sx - label.get_width() // 2, ground_y + 12))

        if len(self.path) > 1:
            points = [to_screen(px, py) for px, py in self.path]
            pygame.draw.lines(self.screen, planet.accent, False, points, 4)

        launch_pos = to_screen(0, self.height_slider.value)
        pygame.draw.circle(self.screen, WHITE, launch_pos, 8)
        launch_label = self.small_font.render("Launch point", True, WHITE)
        self.screen.blit(launch_label, (launch_pos[0] + 14, launch_pos[1] - 28))

        ball_pos = to_screen(self.x, self.y)
        pygame.draw.circle(self.screen, BALL, ball_pos, 12)
        pygame.draw.circle(self.screen, (255, 238, 225), ball_pos, 12, 2)

        if self.show_vectors:
            end = (ball_pos[0] + int(self.vx * 1.2), ball_pos[1] - int(self.vy * 1.2))
            pygame.draw.line(self.screen, VECTOR, ball_pos, end, 3)
            self.draw_arrowhead(end, math.atan2(ball_pos[1] - end[1], end[0] - ball_pos[0]), VECTOR)
            label = self.small_font.render("velocity", True, VECTOR)
            self.screen.blit(label, (end[0] + 6, end[1] - 18))

        overlay = pygame.Rect(rect.x + 16, rect.y + 16, 284, 110)
        pygame.draw.rect(self.screen, (8, 14, 22), overlay, border_radius=16)
        pygame.draw.rect(self.screen, (102, 119, 140), overlay, 1, border_radius=16)
        lines = [
            f"Planet: {planet.name}",
            f"Gravity: {planet.gravity:.2f} m/s^2",
            f"Distance: {self.range:.1f} m",
            f"Height: {self.y:.1f} m",
        ]
        for idx, text in enumerate(lines):
            font = self.label_font if idx == 0 else self.small_font
            color = TEXT if idx == 0 else MUTED
            rendered = font.render(text, True, color)
            self.screen.blit(rendered, (overlay.x + 14, overlay.y + 12 + idx * 24))

    def draw_arrowhead(self, tip: tuple[int, int], angle: float, color: tuple[int, int, int]) -> None:
        size = 10
        points = [
            tip,
            (tip[0] - size * math.cos(angle - 0.35), tip[1] + size * math.sin(angle - 0.35)),
            (tip[0] - size * math.cos(angle + 0.35), tip[1] + size * math.sin(angle + 0.35)),
        ]
        pygame.draw.polygon(self.screen, color, points)

    def draw_graph(self, rect: pygame.Rect) -> None:
        self.draw_panel(rect)
        title = self.section_font.render("Trajectory Graph", True, TEXT)
        self.screen.blit(title, (rect.x + 18, rect.y + 14))

        graph = pygame.Rect(rect.x + 16, rect.y + 52, rect.width - 32, rect.height - 68)
        pygame.draw.rect(self.screen, CARD, graph, border_radius=16)

        left = graph.x + 48
        bottom = graph.bottom - 34
        width = graph.width - 72
        height = graph.height - 60

        max_x = max(10.0, max(point[0] for point in self.path) * 1.08)
        max_y = max(10.0, max(point[1] for point in self.path) * 1.15 + 2)
        step_x = nice_number(max_x / 4)
        step_y = nice_number(max_y / 4)

        tick = 0.0
        while tick <= max_y + 0.01:
            y = bottom - (tick / max_y) * height
            pygame.draw.line(self.screen, GRID, (left, int(y)), (left + width, int(y)), 1)
            label = self.small_font.render(f"{tick:.0f}", True, MUTED)
            self.screen.blit(label, (left - 34, int(y) - 9))
            tick += step_y

        tick = 0.0
        while tick <= max_x + 0.01:
            x = left + (tick / max_x) * width
            pygame.draw.line(self.screen, GRID, (int(x), bottom), (int(x), bottom - height), 1)
            label = self.small_font.render(f"{tick:.0f}", True, MUTED)
            self.screen.blit(label, (int(x) - label.get_width() // 2, bottom + 8))
            tick += step_x

        pygame.draw.line(self.screen, WHITE, (left, bottom - height), (left, bottom), 2)
        pygame.draw.line(self.screen, WHITE, (left, bottom), (left + width, bottom), 2)

        if len(self.path) > 1:
            points = []
            for px, py in self.path:
                gx = left + (px / max_x) * width
                gy = bottom - (py / max_y) * height
                points.append((int(gx), int(gy)))
            pygame.draw.lines(self.screen, GRAPH_LINE, False, points, 3)
            pygame.draw.circle(self.screen, BALL, points[-1], 6)

        x_label = self.small_font.render("Horizontal Distance (m)", True, MUTED)
        self.screen.blit(x_label, (left + width // 2 - x_label.get_width() // 2, graph.bottom - 24))

        y_label = self.small_font.render("Height (m)", True, MUTED)
        y_surface = pygame.transform.rotate(y_label, 90)
        self.screen.blit(y_surface, (graph.x + 6, graph.y + graph.height // 2 - y_surface.get_height() // 2))

    def draw_info(self, rect: pygame.Rect) -> None:
        self.draw_panel(rect)
        title = self.section_font.render("Vital Information", True, TEXT)
        self.screen.blit(title, (rect.x + 18, rect.y + 14))

        cards = [
            ("Range", f"{self.range:.1f} m"),
            ("Max Height", f"{self.max_height:.1f} m"),
            ("Flight Time", f"{self.time_elapsed:.2f} s"),
            ("Speed", f"{math.hypot(self.vx, self.vy):.1f} m/s"),
            ("Horizontal v", f"{self.vx:.1f} m/s"),
            ("Vertical v", f"{self.vy:.1f} m/s"),
        ]

        card_w = (rect.width - 44) // 3
        for index, (label, value) in enumerate(cards):
            row = index // 3
            col = index % 3
            card = pygame.Rect(rect.x + 14 + col * (card_w + 8), rect.y + 52 + row * 92, card_w, 82)
            pygame.draw.rect(self.screen, CARD, card, border_radius=14)
            text = self.small_font.render(label, True, MUTED)
            val = self.metric_font.render(value, True, TEXT)
            self.screen.blit(text, (card.x + 12, card.y + 10))
            self.screen.blit(val, (card.x + 12, card.y + 32))

        eq_rect = pygame.Rect(rect.x + 14, rect.y + 244, rect.width - 28, rect.height - 258)
        pygame.draw.rect(self.screen, CARD, eq_rect, border_radius=16)
        section = self.label_font.render("Algebra Connection", True, TEXT)
        self.screen.blit(section, (eq_rect.x + 14, eq_rect.y + 12))

        angle = math.radians(self.angle_slider.value)
        speed = max(self.speed_slider.value, 0.001)
        g = self.planet.gravity
        a = -g / (2 * speed * speed * max(math.cos(angle) ** 2, 0.001))
        b = math.tan(angle)
        c = self.height_slider.value

        eq_lines = [
            f"Path model: y = {a:.4f}x^2 + {b:.3f}x + {c:.1f}",
            "This is a parabola, so students can match the picture to the graph and equation.",
            f"On {self.planet.name}, gravity is {g:.2f} m/s^2, which makes the x^2 term more negative",
            "when gravity gets stronger. That means the arc bends downward faster.",
        ]
        for index, line in enumerate(eq_lines):
            rendered = self.small_font.render(line, True, self.planet.accent if index == 0 else MUTED)
            self.screen.blit(rendered, (eq_rect.x + 14, eq_rect.y + 48 + index * 24))

    def draw_controls(self, rect: pygame.Rect) -> None:
        self.draw_panel(rect)
        title = self.section_font.render("Adjust Parameters", True, TEXT)
        self.screen.blit(title, (rect.x + 18, rect.y + 12))

        top = rect.y + 54
        col_w = (rect.width - 72) // 5

        self.planet_dropdown.set_rect(pygame.Rect(rect.x + 18, top + 12, col_w - 10, 44))
        self.planet_dropdown.draw(self.screen, self.label_font, self.small_font)

        sliders = [
            self.speed_slider,
            self.angle_slider,
            self.height_slider,
            self.zoom_slider,
            self.dt_slider,
        ]
        for index, slider in enumerate(sliders, start=1):
            x = rect.x + 18 + index * col_w
            slider.set_rect(pygame.Rect(x, top + 28, col_w - 28, 10))
            slider.draw(self.screen, self.small_font, self.small_font)

        button_y = rect.bottom - 58
        self.launch_button.rect = pygame.Rect(rect.right - 380, button_y, 148, 40)
        self.reset_button.rect = pygame.Rect(rect.right - 220, button_y, 96, 40)
        self.balance_button.rect = pygame.Rect(rect.right - 112, button_y, 96, 40)
        self.launch_button.draw(self.screen, self.button_font)
        self.reset_button.draw(self.screen, self.button_font)
        self.balance_button.draw(self.screen, self.button_font)

        hint = self.small_font.render("Tip: compare 30°, 45°, and 60° to see how the graph and range change.", True, MUTED)
        self.screen.blit(hint, (rect.x + 18, rect.bottom - 48))

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.QUIT:
            raise SystemExit

        if event.type == pygame.VIDEORESIZE:
            width = max(MIN_WIDTH, event.w)
            height = max(MIN_HEIGHT, event.h)
            self.screen = pygame.display.set_mode((width, height), pygame.RESIZABLE)

        changed_planet = self.planet_dropdown.handle_event(event)
        if changed_planet:
            self.reset_shot()

        sliders = [self.speed_slider, self.angle_slider, self.height_slider, self.zoom_slider, self.dt_slider]
        any_changed = False
        for slider in sliders:
            if slider.handle_event(event):
                any_changed = True
        if any_changed and not self.running:
            self.reset_shot()

        if self.launch_button.clicked(event):
            self.toggle_launch()
        elif self.reset_button.clicked(event):
            self.reset_shot()
        elif self.balance_button.clicked(event):
            self.set_balanced_shot()

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                self.toggle_launch()
            elif event.key == pygame.K_v:
                self.show_vectors = not self.show_vectors

    def run(self) -> None:
        while True:
            for event in pygame.event.get():
                self.handle_event(event)

            self.update_simulation()
            self.draw()
            self.clock.tick(FPS)


if __name__ == "__main__":
    GravityLessonApp().run()
