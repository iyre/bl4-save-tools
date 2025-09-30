# Analyze XP requirements for character and specialization levels in Borderlands 4

from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

def analyze_xp_curve(csv_path, label, skip_levels=4, ax=None):
    # Load data from CSV
    df = pd.read_csv(csv_path)

    # Drop rows with missing points_net or points_total
    df = df.dropna(subset=['points_total'])

    # Convert to integers
    df['level'] = df['level'].astype(int)
    df['points_total'] = df['points_total'].astype(int)

    # Trim off the first N levels (default: 4)
    df = df[df['level'] > skip_levels]

    # Prepare arrays for fitting
    levels = df['level'].to_numpy()
    xp = df['points_total'].to_numpy()

    # Fit cubic curve
    coeffs3 = np.polyfit(levels, xp, 3)
    poly3 = np.poly1d(coeffs3)

    # Predict values
    xp_pred3 = poly3(levels)

    # Calculate Mean Squared Error (MSE)
    mse3 = np.mean((xp - xp_pred3) ** 2)

    # Calculate R^2 (coefficient of determination)
    r2_3 = 1 - np.sum((xp - xp_pred3) ** 2) / np.sum((xp - np.mean(xp)) ** 2)

    print(f"\n=== {label} XP Curve ===")
    print("Cubic MSE:", mse3, "R^2:", r2_3)
    print("Cubic formula: XP = {:.6f} * level^3 + {:.6f} * level^2 + {:.6f} * level + {:.6f}".format(
        coeffs3[0], coeffs3[1], coeffs3[2], coeffs3[3]
    ))
    print(
        "return (\n"
        f"  {coeffs3[0]:.6f} * Math.pow(level, 3) +\n"
        f"  {coeffs3[1]:.6f} * Math.pow(level, 2) +\n"
        f"  {coeffs3[2]:.6f} * level +\n"
        f"  {coeffs3[3]:.6f}\n);"
    )

    OUTLIER_PCT_THRESHOLD = 0.05

    outliers = []
    for lvl, actual, pred3 in zip(levels, xp, xp_pred3):
        diff3 = pred3 - actual
        is_outlier = abs(diff3) > OUTLIER_PCT_THRESHOLD * actual
        outlier_mark = " <== OUTLIER" if is_outlier else ""
        print(f"Level {lvl:02d}: {diff3:+8.2f}{outlier_mark}")
        if is_outlier:
            outliers.append((lvl, actual, pred3, diff3))

    if outliers:
        print("\nOutlier levels:")
        for lvl, actual, pred3, diff3 in outliers:
            print(f"  Level {lvl:02d}: Actual={actual}, Predicted={pred3:.2f}, Diff={diff3:+.2f}")

    print("\nPredicted XP at 50-level intervals up to 700:")
    for lvl in range(0, 701, 50):
        pred = poly3(lvl)
        print(f"Level {lvl:03d}: Predicted Total XP = {pred:.0f}")

    # Plot data points
    ax.scatter(levels, xp, label=f'{label} Data')

    # Plot smooth cubic fit
    level_range = np.linspace(levels.min(), levels.max(), 200)
    ax.plot(level_range, poly3(level_range), label=f'{label} Cubic fit')
    ax.set_xlabel('Level')
    ax.set_ylabel('Total XP')
    ax.set_title(f'{label} XP Curve')
    ax.legend()
    ax.yaxis.set_major_formatter(mticker.StrMethodFormatter('{x:,.0f}'))


if __name__ == "__main__":
    script_dir = Path(__file__).parent
    char_csv = script_dir / '../data/xp_character.csv'
    spec_csv = script_dir / '../data/xp_specialization.csv'

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    # analyze_xp_curve(char_csv, "Character", skip_levels=4, ax=ax1)
    analyze_xp_curve(spec_csv, "Specialization", skip_levels=100, ax=ax2)

    plt.tight_layout()
    plt.show()

