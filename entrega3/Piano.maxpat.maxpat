{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 1,
            "revision": 5,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 34.0, 77.0, 1468.0, 705.0 ],
        "openinpresentation": 1,
        "boxes": [
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 28.0,
                    "id": "title",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 52.0, 24.0, 390.0, 72.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 52.0, 24.0, 390.0, 72.0 ],
                    "text": "PIANO\n"
                }
            },
            {
                "box": {
                    "fontface": 0,
                    "fontsize": 12.0,
                    "id": "sub",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 65.0, 420.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 65.0, 420.0, 20.0 ],
                    "text": "ACOUSTIC GRAND PIANO · MODOS DE SONIDO"
                }
            },
            {
                "box": {
                    "fontface": 0,
                    "fontsize": 12.0,
                    "id": "hint",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 92.0, 550.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 92.0, 550.0, 20.0 ],
                    "text": "Elige un modo y vuelve a tocar: los cambios son inmediatos."
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "keylab",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 126.0, 100.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 126.0, 100.0, 20.0 ],
                    "text": "TECLADO"
                }
            },
            {
                "box": {
                    "id": "keys",
                    "maxclass": "kslider",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "offset": 21,
                    "outlettype": [ "int", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 55.0, 151.0, 988.0, 79.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 151.0, 988.0, 79.0 ],
                    "range": 88
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "modes",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 330.0, 180.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 330.0, 180.0, 20.0 ],
                    "text": "MODOS DE SONIDO"
                }
            },
            {
                "box": {
                    "background": 1,
                    "bgcolor": [ 0.16, 0.32, 0.45, 1.0 ],
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "clean",
                    "maxclass": "textbutton",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 55.0, 360.0, 175.0, 58.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 360.0, 175.0, 58.0 ],
                    "rounded": 8.0,
                    "text": "CLEAN PIANO"
                }
            },
            {
                "box": {
                    "background": 1,
                    "bgcolor": [ 0.25, 0.38, 0.22, 1.0 ],
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "bright",
                    "maxclass": "textbutton",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 260.0, 360.0, 175.0, 58.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 260.0, 360.0, 175.0, 58.0 ],
                    "rounded": 8.0,
                    "text": "BRIGHT PIANO"
                }
            },
            {
                "box": {
                    "background": 1,
                    "bgcolor": [ 0.42, 0.24, 0.15, 1.0 ],
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "electric",
                    "maxclass": "textbutton",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 465.0, 360.0, 175.0, 58.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 465.0, 360.0, 175.0, 58.0 ],
                    "rounded": 8.0,
                    "text": "ELECTRIC"
                }
            },
            {
                "box": {
                    "background": 1,
                    "bgcolor": [ 0.38, 0.18, 0.32, 1.0 ],
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "harpsi",
                    "maxclass": "textbutton",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 670.0, 360.0, 175.0, 58.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 670.0, 360.0, 175.0, 58.0 ],
                    "rounded": 8.0,
                    "text": "HARPSICHORD"
                }
            },
            {
                "box": {
                    "background": 1,
                    "bgcolor": [ 0.22, 0.22, 0.22, 1.0 ],
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "bass",
                    "maxclass": "textbutton",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 875.0, 360.0, 175.0, 58.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 875.0, 360.0, 175.0, 58.0 ],
                    "rounded": 8.0,
                    "text": "DEEP BASS"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "controls",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 455.0, 120.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 55.0, 455.0, 120.0, 20.0 ],
                    "text": "CONTROLES"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "vl",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 80.0, 490.0, 80.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 80.0, 490.0, 80.0, 20.0 ],
                    "text": "VOLUME"
                }
            },
            {
                "box": {
                    "id": "volume",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 75.0, 517.0, 185.0, 48.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 75.0, 517.0, 185.0, 48.0 ]
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "sl",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 345.0, 490.0, 90.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 345.0, 490.0, 90.0, 20.0 ],
                    "text": "SUSTAIN"
                }
            },
            {
                "box": {
                    "id": "sustain",
                    "maxclass": "dial",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "float" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 350.0, 515.0, 90.0, 90.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 350.0, 515.0, 90.0, 90.0 ]
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "rl",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 585.0, 490.0, 70.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 585.0, 490.0, 70.0, 20.0 ],
                    "text": "SPACE"
                }
            },
            {
                "box": {
                    "id": "space",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 590.0, 515.0, 45.0, 95.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 590.0, 515.0, 45.0, 95.0 ]
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 12.0,
                    "id": "el",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 805.0, 490.0, 70.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 805.0, 490.0, 70.0, 20.0 ],
                    "text": "ECHO"
                }
            },
            {
                "box": {
                    "id": "echo",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 810.0, 515.0, 45.0, 95.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 810.0, 515.0, 45.0, 95.0 ]
                }
            },
            {
                "box": {
                    "fontface": 0,
                    "fontsize": 12.0,
                    "id": "note",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 430.0, 625.0, 400.0, 20.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 430.0, 625.0, 400.0, 20.0 ],
                    "text": "Los modos cambian el instrumento MIDI para las notas nuevas."
                }
            },
            {
                "box": {
                    "id": "mk",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 2,
                    "outlettype": [ "float", "float" ],
                    "patching_rect": [ 145.0, 755.0, 121.0, 22.0 ],
                    "text": "makenote 100 12000"
                }
            },
            {
                "box": {
                    "id": "nout",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 0,
                    "patching_rect": [ 290.0, 755.0, 100.0, 22.0 ],
                    "text": "noteout"
                }
            },
            {
                "box": {
                    "id": "pgm",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 0,
                    "patching_rect": [ 560.0, 755.0, 100.0, 22.0 ],
                    "text": "pgmout"
                }
            },
            {
                "box": {
                    "id": "vctl",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 0,
                    "patching_rect": [ 934.5, 755.0, 100.0, 22.0 ],
                    "text": "ctlout 7"
                }
            },
            {
                "box": {
                    "id": "sctl",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 0,
                    "patching_rect": [ 1044.5, 755.0, 100.0, 22.0 ],
                    "text": "ctlout 64"
                }
            },
            {
                "box": {
                    "id": "rctl",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 0,
                    "patching_rect": [ 1154.5, 755.0, 100.0, 22.0 ],
                    "text": "ctlout 91"
                }
            },
            {
                "box": {
                    "id": "ectl",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 0,
                    "patching_rect": [ 1154.5, 795.0, 100.0, 22.0 ],
                    "text": "ctlout 93"
                }
            },
            {
                "box": {
                    "id": "p0",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 480.0, 795.0, 55.0, 22.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "id": "p1",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 545.0, 795.0, 55.0, 22.0 ],
                    "text": "2"
                }
            },
            {
                "box": {
                    "id": "p4",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 610.0, 795.0, 55.0, 22.0 ],
                    "text": "4"
                }
            },
            {
                "box": {
                    "id": "p6",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 675.0, 795.0, 55.0, 22.0 ],
                    "text": "6"
                }
            },
            {
                "box": {
                    "id": "p32",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 740.0, 795.0, 55.0, 22.0 ],
                    "text": "32"
                }
            },
            {
                "box": {
                    "id": "lb",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 830.0, 850.0, 100.0, 22.0 ],
                    "text": "loadbang"
                }
            },
            {
                "box": {
                    "id": "vinit",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 982.5, 858.6666922569275, 55.0, 22.0 ],
                    "text": "102"
                }
            },
            {
                "box": {
                    "id": "zinit",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 1100.0000327825546, 850.0, 55.0, 22.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "id": "noteorder",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "int", "bang" ],
                    "patching_rect": [ 65.0, 755.0, 50.0, 22.0 ],
                    "text": "t i b"
                }
            },
            {
                "box": {
                    "id": "currentprogram",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "patching_rect": [ 480.0, 840.0000250339508, 50.0, 22.0 ],
                    "text": "int 0"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "techhead",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 670.0, 340.0, 23.0 ],
                    "text": "LÓGICA TÉCNICA — MIDI"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "technotes",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 55.0, 710.0, 360.0, 23.0 ],
                    "text": "1. NOTAS: kslider → trigger → makenote → noteout"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "techmodes",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 450.0, 710.0, 377.0, 23.0 ],
                    "text": "2. MODOS: botones → programa MIDI actual → pgmout"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "techcontrols",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 842.0, 710.0, 505.0, 23.0 ],
                    "text": "3. CONTROLES: CC7 volumen · CC64 sustain · CC91 reverb · CC93 chorus"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "fontsize": 14.0,
                    "id": "techinit",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 805.0, 815.0, 410.0, 23.0 ],
                    "text": "4. INICIO: carga Clean Piano, volumen al 80% y efectos en 0."
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "p32", 0 ],
                    "source": [ "bass", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "p1", 0 ],
                    "source": [ "bright", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "p0", 0 ],
                    "source": [ "clean", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "pgm", 0 ],
                    "source": [ "currentprogram", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "ectl", 0 ],
                    "source": [ "echo", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "p4", 0 ],
                    "source": [ "electric", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "p6", 0 ],
                    "source": [ "harpsi", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "mk", 1 ],
                    "source": [ "keys", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "noteorder", 0 ],
                    "source": [ "keys", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "p0", 0 ],
                    "order": 2,
                    "source": [ "lb", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "vinit", 0 ],
                    "order": 1,
                    "source": [ "lb", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "zinit", 0 ],
                    "order": 0,
                    "source": [ "lb", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "nout", 1 ],
                    "source": [ "mk", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "nout", 0 ],
                    "source": [ "mk", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "currentprogram", 0 ],
                    "source": [ "noteorder", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "mk", 0 ],
                    "source": [ "noteorder", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "currentprogram", 0 ],
                    "source": [ "p0", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "currentprogram", 0 ],
                    "source": [ "p1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "currentprogram", 0 ],
                    "source": [ "p32", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "currentprogram", 0 ],
                    "source": [ "p4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "currentprogram", 0 ],
                    "source": [ "p6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "rctl", 0 ],
                    "source": [ "space", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "sctl", 0 ],
                    "source": [ "sustain", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "volume", 0 ],
                    "source": [ "vinit", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "vctl", 0 ],
                    "source": [ "volume", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "echo", 0 ],
                    "order": 0,
                    "source": [ "zinit", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "space", 0 ],
                    "order": 1,
                    "source": [ "zinit", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "sustain", 0 ],
                    "order": 2,
                    "source": [ "zinit", 0 ]
                }
            }
        ],
        "autosave": 0
    }
}