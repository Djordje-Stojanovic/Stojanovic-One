-- Clear existing data for non-USD companies to force refresh with converted values
DELETE FROM income_statements WHERE reported_currency != 'USD';
DELETE FROM balance_sheets WHERE reported_currency != 'USD';
DELETE FROM cash_flow_statements WHERE reported_currency != 'USD';
