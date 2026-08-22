# -*- coding: utf-8 -*-
{
    'name': 'GlobeTrotter',
    'version': '17.0.1.0.0',
    'category': 'Services/Travel',
    'summary': 'Personalized Travel Planning Platform',
    'description': """
GlobeTrotter Backend Module
===========================
Custom Odoo module for managing trips, cities, stops, activities, budgets, and trip sharing.

Features:
---------
* Core Trip Management
* City & Stop Destinations
* Scheduled Activities
* Server-side Budget Calculations
* Public Trip Sharing
""",
    'author': 'GlobeTrotter Backend Team',
    'website': 'https://github.com/buildwithpriince/odoo-TEAM-MSU-',
    'license': 'LGPL-3',
    'depends': [
        'base',
    ],
    'data': [
        'security/ir.model.access.csv',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}
