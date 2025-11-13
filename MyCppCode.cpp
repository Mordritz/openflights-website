#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() 
{
    vector<string> msg {"Congrats", "on", "building", "C++ code", "using CMake!"};

    for (const string& word : msg)
    {
        cout << word << " ";
    }
    cout << endl;
}