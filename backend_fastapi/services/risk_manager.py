from typing import Dict, Any

class RiskManager:
    """
    Server-side risk validation engine. Enforces capital preservation,
    maximum order sizes, exposure ceilings, and kill switch rules.
    """
    @staticmethod
    def validate_order(
        order_gross_value: float,
        projected_exposure: float,
        available_cash: float,
        total_order_cost: float,
        side: str,
        owned_quantity: int,
        requested_quantity: int,
        risk_settings: Dict[str, Any]
    ) -> None:
        # 1. Kill Switch Check
        if risk_settings.get("killSwitchActive", False):
            raise ValueError("Risk Limit Violation: Emergency Kill Switch is currently ACTIVE. Trading is locked.")

        # 2. Max Order Value Check (Default ₹10,000)
        max_order_val = risk_settings.get("maxOrderValue", 10000.0)
        if order_gross_value > max_order_val:
            raise ValueError(
                f"Risk Limit Violation: Gross order value ₹{order_gross_value:,.2f} exceeds "
                f"maximum allowed order limit of ₹{max_order_val:,.2f}. Reduce quantity."
            )

        # 3. BUY-side validation: Cash balance and Exposure ceilings
        if side == 'BUY':
            if available_cash < total_order_cost:
                raise ValueError(
                    f"Insufficient Virtual Cash: Required ₹{total_order_cost:,.2f} (including fees), "
                    f"but available balance is ₹{available_cash:,.2f}."
                )

            max_exposure = risk_settings.get("maxExposurePerInstrument", 20000.0)
            if projected_exposure > max_exposure:
                raise ValueError(
                    f"Risk Limit Violation: Projected instrument exposure ₹{projected_exposure:,.2f} "
                    f"exceeds the maximum limit of ₹{max_exposure:,.2f}."
                )

        # 4. SELL-side validation: Holding ownership
        if side == 'SELL':
            if owned_quantity < requested_quantity:
                raise ValueError(
                    f"Insufficient Holdings: Cannot SELL {requested_quantity} shares. "
                    f"You currently own {owned_quantity} shares."
                )
