# Analyze XP requirements for character and specialization levels in Borderlands 4

from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

def analyze_xp_curve(csv_path, label, skip_levels=4):
    # Load data from CSV
    df = pd.read_csv(csv_path)

    # Drop rows with missing points_net or points_total
    df = df.dropna(subset=['points_net', 'points_total'])

    # Convert to integers
    df['level'] = df['level'].astype(int)
    df['points_net'] = df['points_net'].astype(int)
    df['points_total'] = df['points_total'].astype(int)

    # Trim off the first N levels (default: 4)
    df = df[df['level'] > skip_levels]

    # Prepare arrays for fitting
    levels = df['level'].to_numpy()
    xp = df['points_total'].to_numpy()
    netpoints = df['points_net'].to_numpy()

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

    # Print predicted vs actual
    for lvl, actual, pred3 in zip(levels, xp, xp_pred3):
        diff3 = pred3 - actual
        print(f"Level {lvl:02d}: {diff3:+8.2f}")

    # Plot data points
    plt.scatter(levels, xp, label=f'{label} Data')

    # Plot smooth cubic fit
    level_range = np.linspace(levels.min(), levels.max(), 200)
    plt.plot(level_range, poly3(level_range), label=f'{label} Cubic fit')

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    char_csv = script_dir / '../data/xp_character.csv'
    spec_csv = script_dir / '../data/xp_specialization.csv'

    plt.figure(figsize=(10, 6))
    analyze_xp_curve(char_csv, "Character", skip_levels=4)
    analyze_xp_curve(spec_csv, "Specialization", skip_levels=0)  # Adjust skip_levels as needed

    plt.xlabel('Level')
    plt.ylabel('Total XP')
    plt.title('XP Curves')
    plt.legend()
    plt.gca().yaxis.set_major_formatter(mticker.StrMethodFormatter('{x:,.0f}'))  # <-- Add this line
    plt.tight_layout()
    plt.show()

