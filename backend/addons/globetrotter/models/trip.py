# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class GlobetrotterTrip(models.Model):
    _name = 'globetrotter.trip'
    _description = 'GlobeTrotter Trip'
    _order = 'start_date desc, id desc'

    name = fields.Char(string='Trip Name', required=True)
    description = fields.Text(string='Description')
    user_id = fields.Many2one(
        'res.users',
        string='Owner',
        required=True,
        default=lambda self: self.env.user,
        ondelete='cascade',
        index=True
    )
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    target_budget = fields.Monetary(
        string='Target Budget',
        currency_field='currency_id',
        default=0.0
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Currency',
        default=lambda self: self.env.company.currency_id
    )
    state = fields.Selection([
        ('draft', 'Draft'),
        ('planned', 'Planned'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='draft', required=True)
    cover_image = fields.Char(string='Cover Image URL')
    travel_vibe = fields.Char(string='Travel Vibe')

    @api.constrains('start_date', 'end_date')
    def _check_dates(self):
        for record in self:
            if record.start_date and record.end_date and record.start_date > record.end_date:
                raise ValidationError(_("Start date (%s) cannot be after end date (%s).") % (record.start_date, record.end_date))

    @api.constrains('target_budget')
    def _check_target_budget(self):
        for record in self:
            if record.target_budget < 0:
                raise ValidationError(_("Target budget cannot be negative."))
